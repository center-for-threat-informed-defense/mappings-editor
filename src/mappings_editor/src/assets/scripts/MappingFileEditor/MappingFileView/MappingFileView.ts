import { MappingFileEditor } from '@/assets/scripts/MappingFileEditor';
import { MappingFile, MappingObject } from "../../MappingFile";
import { MappingObjectDiscriminator } from "./MappingObjectDiscriminator";
import { 
    BreakoutControl,
    FilterControl, 
    FrameworkListingFilterControl,
    ListPropertyFilterControl
} from "./Controls";
import {
    MappingFileViewItem,
    MappingGroupSectionView,
    MappingObjectView,
    MappingStatusSectionView,
    MappingTypeSectionView,
    BreakoutSectionView,
    SourceObjectSectionView,
    TargetObjectSectionView
} from "./MappingFileViewItem";

export class MappingFileView {

    /**
     * The view's sizing configuration.
     */
    private readonly _sizing: SizingConfiguration;

    /**
     * The root view item.
     */
    private _rootItem: MappingFileViewItem | null;

    /**
     * The view's mapping objects.
     */
    private _mappingObjects: Map<string, MappingObjectView>

    /**
     * The view's section index.
     */
    private _discriminatorIndex: DiscriminatorIndex;

    /**
     * The view's internal height (in pixels).
     */
    private _viewHeight: number;

    /**
     * The view's internal content height (in pixels).
     */
    private _contentHeight: number;

    /**
     * The view's internal current position (in pixels).
     */
    private _viewPosition: number;

    /**
     * The view's internal maximum level.
     */
    private _maxLevel: number;

    /**
     * The view's mapping file.
     * Can be from a MappingFileEditor
     * or a MappingFile
     */
    private readonly _source: MappingFileEditor | MappingFile;

    /**
     * The view's available breakouts.
     */
    public breakouts: BreakoutControl;

    /**
     * The view's available filter sets.
     */
    public filterSets: ReadonlyMap<MappingObjectDiscriminator, FilterControl>;

    /**
     * The view's visible view items.
     */
    public visibleItems: ReadonlyArray<MappingFileViewItem>


    /**
     * The view's height (in pixels).
     */
    public get viewHeight(): number {
        return this._viewHeight;
    }

    /**
     * The view's content height (in pixels).
     */
    public get contentHeight(): number {
        return this._contentHeight;
    }

    /**
     * The view's current position (in pixels).
     */
    public get viewPosition(): number {
        return this._viewPosition;
    }

    /**
     * The view's maximum level.
     */
    public get maxLevel(): number {
        return this._maxLevel;
    }

    /**
     * All currently selected {@link MappingFileViewItem}s.
     */
    public get selected(): MappingFileViewItem[] {
        const selected = [];
        for(let item = this._rootItem; item; item = item.next) {
            if(item.selected) {
                selected.push(item);
            }
        }
        return selected;
    }

    /**
     * The mapping view's file
     */
    public get file(): MappingFile {
        if(this._source instanceof MappingFile) {
            return this._source;
        }
        return this._source.file;
    }


    /**
     * Creates a new {@link MappingFileView}.
     * @param file
     *  The view's mapping file.
     * @param sizing
     *  The view's sizing configuration.
     */
    constructor(source: MappingFileEditor | MappingFile, sizing: SizingConfiguration) {
        this._sizing = sizing;
        this._rootItem = null;
        this._mappingObjects = new Map();
        this._discriminatorIndex = new Map();
        this._viewHeight = 0;
        this._contentHeight = 0;
        this._viewPosition = 0;
        this._maxLevel = 0;
        this._source = source;
        this.breakouts = this.defineBreakouts();
        this.filterSets = this.defineFilterSets(this.file);
        this.visibleItems = [];
        this.rebuildBreakouts();
    }

    
    ///////////////////////////////////////////////////////////////////////////
    ///  1. Object Restoration  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Restores an existing {@link MappingObjectView} to the file view.
     * @param view
     *  The {@link MappingObjectView}.
     */
    public restoreMappingObjectView(view: MappingObjectView) {
        this._mappingObjects.set(view.id, view);
    }


    ///////////////////////////////////////////////////////////////////////////
    ///  2. Rebuild Breakout  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    
    
    /**
     * Rebuilds the view's breakouts.
     * @param toRaw
     *  A function that unwraps `this` from a reactive context.
     */
    public rebuildBreakouts(toRaw: <T>(obj: T) => T = obj => obj) {
        const discriminatorIndex: DiscriminatorIndex = new Map();
        const rawThis = toRaw(this);

        // 1. Reload mapping objects
        const mappingObjects = new Map();
        for(const [id, obj] of rawThis.file.mappingObjects) {
            let viewObject = rawThis._mappingObjects.get(id);
            if(!viewObject) {
                viewObject = new MappingObjectView(this, obj);
            } else {
                viewObject.removeItem();
            }
            mappingObjects.set(id, viewObject);
        }
        rawThis._mappingObjects = mappingObjects;

        // 2. Breakout only by items, if applicable
        const dis = rawThis.breakouts.primaryBreakout;
        if(dis === undefined) {

            // 2a. Build items list
            let firstItem: MappingObjectView | null = null;
            let lastItem: MappingObjectView | null = null;
            for(const nextItem of rawThis._mappingObjects.values()) {
                // Filter object
                if(!rawThis.isMappingObjectVisible(nextItem.object)) {
                    continue;
                }
                firstItem ??= nextItem;
                // Insert object
                if(lastItem) {
                    nextItem.insertAfter(lastItem);
                }
                lastItem = nextItem;
                /**
                 * Developer's Note:
                 * To ensure there's always room for warning icons,
                 * never place mapping objects lower than 1.
                 */
                nextItem.level = 1;
            }

            // 2b. Set penultimate level
            this._maxLevel = 0;

            // 2c. Update root item
            this._rootItem = firstItem; 

            // 2d. Recalculate item positions
            this.recalculateViewItemPositions(toRaw);

            return;
        }

        // 3. Build primary breakout
        const values = rawThis.getAllDiscriminatorValues(this.file, dis);
        for(const value of values) {
            // Check if section is filtered
            if(!rawThis.isDiscriminatorValueVisible(value, dis)) {
                continue;
            }
            // Create view
            rawThis.getClosestViewFromDiscriminatorValueSet(
                discriminatorIndex, [dis], [value]
            );
        }

        // 4. Build secondary breakouts
        const activeDiscriminators = rawThis.breakouts.activeBreakouts;
        for(const objectView of rawThis._mappingObjects.values()) {
            // Filter object
            if(!rawThis.isMappingObjectVisible(objectView.object)) {
                continue;
            }
            // Get discriminator values
            const values = activeDiscriminators.map(
                d => rawThis.getDiscriminatorValue(objectView.object, d)
            )
            // Get section view
            const sectionView = rawThis.getClosestViewFromDiscriminatorValueSet(
                discriminatorIndex, activeDiscriminators, values
            )
            // If section view is uncollapsed...
            if(!sectionView.collapsed) {
                // ...update object view level
                objectView.level = sectionView.level + 1;
                // Insert object view into section view
                objectView.insertAtEndOf(sectionView);
            }
        }

        // 5. Sort discriminator index
        rawThis.sortDiscriminatorIndex(discriminatorIndex);

        // 6. Link all sections
        rawThis.linkDiscriminatorIndex(discriminatorIndex);

        // 7. Update discriminator index
        rawThis._discriminatorIndex = discriminatorIndex;

        // 8. Set maximum level
        this._maxLevel = [...rawThis.breakouts.options.values()]
            .reduce((a,b) => a + (b.enabled ? 1 : 0), 0);

        // 9. Configure root item
        this._rootItem = this._discriminatorIndex
            // Get first section index
            .values().next().value
            // Try to get first section
            ?.values().next().value
            // Try to get first section view
            ?.view ?? null; 

        // 10. Recalculate item positions
        this.recalculateViewItemPositions(toRaw);

    }

    /**
     * Tests is a {@link MappingObject} is visible.
     * @param obj
     *  The {@link MappingObject} to test.
     * @returns
     *  True if the {@link MappingObject} is visible, false otherwise.
     */
    private isMappingObjectVisible(obj: MappingObject) {
        let isVisible = true;
        for(const discriminator of this.filterSets.keys()) {
            const value = this.getDiscriminatorValue(obj, discriminator);
            isVisible &&= this.isDiscriminatorValueVisible(value, discriminator);
        }
        return isVisible;
    }

    /**
     * Tests if a discriminator value is visible. 
     * @param value
     *  The discriminator value.
     * @param dis
     *  The {@link MappingObjectDiscriminator}
     * @returns
     *  True if the discriminator value is visible, false otherwise.
     */
    private isDiscriminatorValueVisible(
        value: string | null,
        dis: MappingObjectDiscriminator
    ): boolean {
        const control = this.filterSets.get(dis)
        if(control) {
            return control.isShown(value);
        } else {
            return true;
        }
    }

    /**
     * Returns the value of a {@link MappingObjectDiscriminator} from a
     * {@link MappingObject}.
     * @param obj
     *  The {@link MappingObject}.
     * @param dis
     *  The {@link MappingObjectDiscriminator}.
     * @returns
     *  The value of the {@link MappingObjectDiscriminator}.
     */
    private getDiscriminatorValue(
        obj: MappingObject,
        dis: MappingObjectDiscriminator
    ): string | null {
        switch(dis) {
            case MappingObjectDiscriminator.MappingType:
                return obj.mappingType.value;
            case MappingObjectDiscriminator.MappingGroup:
                return obj.mappingGroup.value;
            case MappingObjectDiscriminator.MappingStatus:
                return obj.mappingStatus.value;
            case MappingObjectDiscriminator.SourceObject:
                return obj.sourceObject.objectId;
            case MappingObjectDiscriminator.TargetObject:
                return obj.targetObject.objectId;
        }
    }

    /**
     * Returns all possible values for a discriminator from a
     * {@link MappingFile}.
     * @param file
     *  The {@link MappingFile} to source the values from.
     * @param dis
     *  The {@link MappingObjectDiscriminator}.
     * @returns
     *  All possible values for the {@link MappingObjectDiscriminator}.
     */
    private getAllDiscriminatorValues(
        file: MappingFile,
        dis: MappingObjectDiscriminator
    ): (string | null)[] {
        let options: (string | null)[];
        switch(dis) {
            case MappingObjectDiscriminator.MappingType:
                options = [...file.mappingTypes.value.keys()];
                break; 
            case MappingObjectDiscriminator.MappingGroup:
                options = [...file.mappingGroups.value.keys()];
                break;
            case MappingObjectDiscriminator.MappingStatus:
                options = [...file.mappingStatuses.value.keys()];
                break;
            case MappingObjectDiscriminator.SourceObject:
                if(file.sourceFrameworkListing) {
                    options = [...file.sourceFrameworkListing.options.keys()]
                } else {
                    options = [...new Set(
                        [...file.mappingObjects.values()].map(
                            o => o.sourceObject.objectId
                        )
                    )]
                }
                break;
            case MappingObjectDiscriminator.TargetObject:
                if(file.targetFrameworkListing) {
                    options = [...file.targetFrameworkListing.options.keys()]
                } else {
                    options = [...new Set(
                        [...file.mappingObjects.values()].map(
                            o => o.targetObject.objectId
                        )
                    )]
                }
                break;
        }
        return options;
    }

    /**
     * Gets the closest accessible {@link BreakoutSectionView} from a discriminator
     * index using a set of discriminator values. If the view doesn't exist in
     * the index, the function attempts to update the index using a view from
     * the {@link MappingFileView}'s existing discriminator index. If neither
     * have the view, a new one is created and added to the index. 
     * @param discriminatorIndex
     *  The discriminator index.
     * @param discriminators
     *  The list of {@link MappingObjectDiscriminator}.
     * @param values
     *  The list of discriminator values.
     * @returns
     *  The retrieved {@link BreakoutSectionView}.
     */
    private getClosestViewFromDiscriminatorValueSet(
        discriminatorIndex: DiscriminatorIndex,
        discriminators: MappingObjectDiscriminator[],
        values: (string | null)[]
    ): BreakoutSectionView {
        let nextSection: SectionInfo;
        let nextDiscriminatorIndex: DiscriminatorIndex;
        let nextSectionIndex: SectionIndex;
        let existingDiscriminatorIndex: DiscriminatorIndex | undefined;
        let existingSectionIndex: SectionIndex | undefined;
        
        // Validate discriminators exist
        if(discriminators.length === 0) {
            throw new Error("At least one discriminator must be specified.");
        }
        // Validate discriminators and values align
        if(discriminators.length !== values.length) {
            throw new Error("The number of discriminators and values must match.");
        }

        // Iterate discriminator index
        nextDiscriminatorIndex = discriminatorIndex;
        existingDiscriminatorIndex = this._discriminatorIndex;
        for(let i = 0; i < discriminators.length; i++) {
            const value = values[i];
            const discriminator = discriminators[i];
            
            // Traverse next section index
            if(!nextDiscriminatorIndex.has(discriminator)) {
                nextDiscriminatorIndex.set(discriminator, new Map())
            }
            nextSectionIndex = nextDiscriminatorIndex.get(discriminator)!;
            // Traverse existing section index
            existingSectionIndex = existingDiscriminatorIndex?.get(discriminator);

            // Try to retrieve an existing section
            const existingSection: SectionInfo | undefined = existingSectionIndex?.get(value)!;

            // If the next section index already has the section...
            if(nextSectionIndex.has(value)) {
                // ...use it
                nextSection = nextSectionIndex.get(value)!
            }
            // Otherwise, try to use the existing section
            else if(existingSection) {
                // Remove the existing view from its existing list 
                existingSection.view.removeItem();
                // Create next section using the existing view
                nextSection = {
                    view: existingSection.view,
                    discriminators: new Map()
                }
            }
            // Otherwise, create a completely new section
            else {
                nextSection = {
                    view: this.createViewFromDiscriminatorValue(value, discriminator),
                    discriminators: new Map()
                }
                // Set level
                nextSection.view.level = i;
            }
            
            // Update next section index
            nextSectionIndex.set(value, nextSection);

            // Traverse next discriminator index
            nextDiscriminatorIndex = nextSection.discriminators
            // Traverse existing discriminator index
            existingDiscriminatorIndex = existingSection?.discriminators;

            // If the next section is collapsed...
            if(nextSection.view.collapsed) {
                // ...it's the closest accessible view
                return nextSection.view;
            }

        }

        // Return the section's view 
        return nextSection!.view;
        
    }

    /**
     * Creates a {@link BreakoutSectionView} from a discriminator value.
     * @param value
     *  The discriminator value.
     * @param dis
     *  The {@link MappingObjectDiscriminator}.
     * @returns
     *  The {@link BreakoutSectionView}.
     */
    private createViewFromDiscriminatorValue(
        value: null | string,
        dis: MappingObjectDiscriminator,
    ): BreakoutSectionView {
        const err = `Invalid discriminator value '${ value }'.`;
        let name, type;
        switch(dis) {
            case MappingObjectDiscriminator.MappingType:
                if(value == null) {
                    name = "No Mapping Type";
                } else if((type = this.file.mappingTypes.value.get(value))) {
                    name = type.getAsString("name")
                } else {
                    throw new Error(err);
                }
                return new MappingTypeSectionView(this, name, value);
            case MappingObjectDiscriminator.MappingGroup:
                if(value == null) {
                    name = "No Mapping Group";
                } else if((type = this.file.mappingGroups.value.get(value))) {
                    name = type.getAsString("name")
                } else {
                    throw new Error(err);
                }
                return new MappingGroupSectionView(this, name, value);
            case MappingObjectDiscriminator.MappingStatus:
                if(value == null) {
                    name = "No Mapping Status";
                } else if((type = this.file.mappingStatuses.value.get(value))) {
                    name = type.getAsString("name")
                } else {
                    throw new Error(err);
                }
                return new MappingStatusSectionView(this, name, value);
            case MappingObjectDiscriminator.SourceObject:
                if(value == null) {
                    name = "No Source";
                } else if ((type = this.file.sourceFrameworkListing?.options.get(value))) {
                    name = `${ value }: ${ type }`;
                } else {
                    name = value
                }
                return new SourceObjectSectionView(this, name, value);
            case MappingObjectDiscriminator.TargetObject:
                if(value == null) {
                    name = "No Target";
                } else if ((type = this.file.targetFrameworkListing?.options.get(value))) {
                    name = `${ value }: ${ type }`;
                } else {
                    name = value
                }
                return new TargetObjectSectionView(this, name, value);
        }
    }

    /**
     * Sorts a {@link DiscriminatorIndex}.
     * @param index
     *  The {@link DiscriminatorIndex}.
     */
    private sortDiscriminatorIndex(index: DiscriminatorIndex) {
        for(const [dis, sectionIndex] of index) {
            index.set(dis, this.sortSectionIndex(sectionIndex, dis));
            for(const section of sectionIndex.values()) {
                this.sortDiscriminatorIndex(section.discriminators);
            }
        }
    }
    
    /**
     * Sorts a {@link SectionIndex}.
     * @param index
     *  The {@link SectionIndex}.
     * @param dis
     *  The {@link SectionIndex}'s {@link MappingObjectDiscriminator}.
     * @returns
     *  The sorted {@link SectionIndex}
     */
    private sortSectionIndex(
        index: SectionIndex,
        dis: MappingObjectDiscriminator
    ): SectionIndex {
        const sections = [...index];
        switch(dis) {
            case MappingObjectDiscriminator.MappingType:
                return new Map(sections.sort(([a], [b]) => {
                    if(a === null) return -1;
                    if(b === null) return 1;
                    const types = this.file.mappingTypes.value;
                    a = types.get(a)!.get("id").toString();
                    b = types.get(b)!.get("id").toString(); 
                    return a.localeCompare(b);
                }))
            case MappingObjectDiscriminator.MappingGroup:
                return new Map(sections.sort(([a], [b]) => {
                    if(a === null) return -1;
                    if(b === null) return 1;
                    const types = this.file.mappingGroups.value;
                    a = types.get(a)!.get("id").toString();
                    b = types.get(b)!.get("id").toString(); 
                    return a.localeCompare(b);
                }))
            case MappingObjectDiscriminator.MappingStatus:
                return new Map(sections.sort(([a], [b]) => {
                    if(a === null) return -1;
                    if(b === null) return 1;
                    const types = this.file.mappingStatuses.value;
                    a = types.get(a)!.get("name").toString();
                    b = types.get(b)!.get("name").toString(); 
                    return a.localeCompare(b);
                }))
            case MappingObjectDiscriminator.SourceObject:
            case MappingObjectDiscriminator.TargetObject:
                return new Map(sections.sort(([a],[b]) => 
                    a === null ? -1 : b === null ? 1 : a.localeCompare(b)
                ));
        }
    }

    /**
     * Links the items in an unlinked {@link DiscriminatorIndex}.
     * @param index
     *  The {@link DiscriminatorIndex}.
     * @param lastItem
     *  The last encountered {@link MappingFileViewItem}.
     * @returns
     *  The last encountered {@link MappingFileViewItem}.
     */
    private linkDiscriminatorIndex(
        index: DiscriminatorIndex,
        lastItem?: MappingFileViewItem
    ): MappingFileViewItem | undefined {
        for(const sectionIndex of index.values()) {
            for(const section of sectionIndex.values()) {
                if(lastItem) {
                    lastItem.next = section.view;
                    section.view.prev = lastItem;
                }
                lastItem = this.linkDiscriminatorIndex(
                    section.discriminators,
                    section.view.getLastItem()
                );
            }
        }
        return lastItem;
    }
    
    
    ///////////////////////////////////////////////////////////////////////////
    ///  3. Recalculate View  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Recalculates all {@link MappingFileViewItem} positions.
     * @param toRaw
     *  A function that unwraps `this` from a reactive context.
     */
    public recalculateViewItemPositions(toRaw: <T>(obj: T) => T = obj => obj) {
        const rawThis = toRaw(this);
        // Recalculate view item positions
        let offset = 0;
        let maxLayer = 0;
        const _sizing = rawThis._sizing;
        const sections = [];
        const sectionHeight = _sizing.sectionHeight + _sizing.sectionPaddingHeight;
        for(let item = rawThis._rootItem; item; item = item.next){
            item.headOffset = offset;
            if(item instanceof BreakoutSectionView) {
                item.layer = ++maxLayer;
                item.height = _sizing.sectionHeight;
                item.padding = _sizing.sectionPaddingHeight;
                for(let i = sections.length - 1; 0 <= i && i >= item.level; i--) {
                    const s = sections[i], height = s.height + s.padding;
                    s.hangOffset = item.headOffset - height;
                    s.hangHeight = s.level * sectionHeight;
                    s.baseOffset = item.headOffset;
                    sections.pop();
                }
                sections.push(item);
                if(item.next instanceof MappingObjectView) {
                    maxLayer++;
                }
            } else if(item instanceof MappingObjectView) {
                item.height = item.collapsed ?
                    _sizing.objectHeightCollapsed :
                    _sizing.objectHeightUncollapsed
                item.padding = item.next instanceof BreakoutSectionView ?
                    _sizing.sectionPaddingHeight :
                    _sizing.objectPaddingHeight;
                item.baseOffset = item.headOffset + item.height + item.padding;
                item.layer = maxLayer;
            }
            offset += item.height;
            offset += item.padding;
        }
        for(let i = sections.length - 1; 0 <= i; i--) {
            const s = sections[i], height = s.height + s.padding;
            s.hangOffset = offset - height;
            s.hangHeight = s.level * sectionHeight;
            s.baseOffset = offset;
            sections.pop();
        }
        // Invert layer value
        for(let item = rawThis._rootItem; item; item = item.next){ 
            item.layer = maxLayer - item.layer;
        }
        this._contentHeight = offset;
        // Update view position
        this.setViewPosition(this._viewPosition);
    }


    ///////////////////////////////////////////////////////////////////////////
    ///  4. Manipulate View  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Selects a {@link MappingFileViewItem}.
     * @remarks
     *  Currently, only {@link MappingObjectView}s are selectable.
     * @param id
     *  The view item's id.
     */
    public selectViewItem(id: string) {
        const obj = this._mappingObjects.get(id);
        if(obj) {
            obj.selected = true;
        }
    }
    
    /**
     * Unselects all {@link MappingFileViewItem}s.
     * @remarks
     *  Currently, only {@link MappingObjectView}s are unselectable.
     */
    public unselectAllViewItems() {
        for(const obj of this._mappingObjects.values()) {
            obj.selected = false;
        }
    }

    /**
     * Moves the current view position to a {@link MappingFileViewItem}.
     * @param id
     *  The view item's id.
     * @param position
     *  The view item's viewport position.
     * @param fromHangers
     *  If true, the position will be relative to the breakout hangers' base.
     *  If false, the position will be relative to the viewport's head.
     * @param strict
     *  If true, the camera WILL move to the specified viewport position. If
     *  false, the camera will only move to the specified viewport position if
     *  the item exists outside the current viewport.
     */
    public moveToViewItem(id: string, position: number, fromHangers: boolean, strict: boolean) {
        // Select item
        let item = this._rootItem;
        let i = 0;
        for(; item; item = item.next) {
            i ++;
            if(item.id === id) break;
        }
        if(!item) return;
        // Compute hanger
        let hangerHeight = 0;
        if(fromHangers) {
            hangerHeight = this.maxLevel * (
                this._sizing.sectionHeight +
                this._sizing.sectionPaddingHeight
            )
        }
        // Check strict
        const itemTop        = item.headOffset;
        const itemBottom     = item.headOffset + item.height;
        const viewportTop    = this.viewPosition + hangerHeight;
        const viewportBottom = this.viewPosition + (this.viewHeight - hangerHeight);
        const visible = viewportTop <= itemTop && itemBottom <= viewportBottom;
        if(!strict && visible){
            return;
        }
        // Move view
        this.setViewPosition(item.headOffset - position - hangerHeight);
    }

    /**
     * Sets the view's height.
     * @param height
     *  The view's height (in pixels).
     */
    public setViewHeight(height: number) {
        // Update view height
        this._viewHeight = height;
        // Correct view position
        this.setViewPosition(this._viewPosition);
    }

    /**
     * Moves the current view position.
     * @param position
     *  The view's current position (in pixels).
     */
    public setViewPosition(position: number) {
        // Update position
        const maxPosition = this._contentHeight - this._viewHeight; 
        this._viewPosition = Math.min(position, Math.max(0, maxPosition));
        // Update visible elements
        this.updateVisibleItems();
    }

    /**
     * Updates the set of visible items.
     */
    private updateVisibleItems() {
        const margin = this._sizing.loadMargin;
        const topBoundary = this._viewPosition - margin;
        const botBoundary = this._viewPosition + this._viewHeight + margin;
        const visibleItems = [];
        let encounteredEnd = false;
        let encounteredStart = false;
        for(let item = this._rootItem; item; item = item.next) {
            if(item instanceof BreakoutSectionView) {
                if(item.headOffset < botBoundary && topBoundary < item.baseOffset) {
                    visibleItems.push(item);
                }
            } else if(item instanceof MappingObjectView) {
                if(item.headOffset < botBoundary && topBoundary < item.baseOffset) {
                    encounteredStart = true;
                    visibleItems.push(item);
                } else if(encounteredStart) {
                    encounteredEnd = true;
                }
            }
            if(encounteredStart && encounteredEnd) break;
        }
        // Update visible items
        this.visibleItems = visibleItems;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    ///  5. Define Breakouts and Filter Sets  /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Defines the view's breakouts.
     * @returns
     *  The view's breakouts.
     */
    private defineBreakouts(): BreakoutControl {
        return new BreakoutControl(
            new Map([
                [
                    MappingObjectDiscriminator.MappingGroup,
                    { text: "Mapping Group", enabled: true }
                ],
                [
                    MappingObjectDiscriminator.MappingStatus,
                    { text: "Mapping Status", enabled: true }
                ],
                [
                    MappingObjectDiscriminator.MappingType,
                    { text: "Mapping Type", enabled: false }
                ],
                [
                    MappingObjectDiscriminator.SourceObject,
                    { text: "Source", enabled: false }
                ],
                [
                    MappingObjectDiscriminator.TargetObject,
                    { text: "Target", enabled: false }
                ]
            ])
        );
    }

    /**
     * Defines a mapping file's filter sets.
     * @param file
     *  The mapping file.
     * @returns
     *  The mapping file's filter sets.
     */
    private defineFilterSets(file: MappingFile): Map<MappingObjectDiscriminator, FilterControl> {
        const filterSets = new Map<MappingObjectDiscriminator, FilterControl>([
            [
                MappingObjectDiscriminator.MappingGroup,
                new ListPropertyFilterControl("name", file.mappingGroups)
            ],
            [
                MappingObjectDiscriminator.MappingStatus,
                new ListPropertyFilterControl("name", file.mappingStatuses)
            ],
            [
                MappingObjectDiscriminator.MappingType,
                new ListPropertyFilterControl("name", file.mappingTypes)
            ],
            [
                MappingObjectDiscriminator.SourceObject,
                new FrameworkListingFilterControl(file.sourceFrameworkListing)
            ],
            [
                MappingObjectDiscriminator.TargetObject,
                new FrameworkListingFilterControl(file.targetFrameworkListing)
            ]
        ]);
        return filterSets;
    }

}

/**
 * Discriminator Index Type
 */
type DiscriminatorIndex = Map<
    MappingObjectDiscriminator, SectionIndex
>

/**
 * Section Index Type
 */
type SectionIndex = Map<
    null | string, SectionInfo
>

/**
 * Section Info type
 */
type SectionInfo = { 

    /**
     * The section's view.
     */
    view: BreakoutSectionView;
    
    /**
     * The section's discriminator index.
     */
    discriminators: DiscriminatorIndex;

}


/**
 * Sizing Configuration type
 */
type SizingConfiguration =  {

    /**
     * The default section height.
     */
    readonly sectionHeight: number,

    /**
     * The default section padding height.
     */
    readonly sectionPaddingHeight: number,

    /**
     * The default (collapsed) mapping object height.
     */
    readonly objectHeightCollapsed: number,

    /**
     * The default (uncollapsed) mapping object height.
     */
    readonly objectHeightUncollapsed: number,

    /**
     * The default object padding height.
     */
    readonly objectPaddingHeight: number,

    /**
     * The default height of the view's load margin.
     */
    readonly loadMargin: number

}
