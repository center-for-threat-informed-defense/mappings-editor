import { type MappingFile, MappingObject, Property, ListItemProperty, FrameworkObjectProperty, ComputedProperty } from "../../MappingFile";
import { MappingObjectDiscriminator } from "./MappingObjectDiscriminator";
import { 
    BreakoutControl,
    FilterControl, 
    FrameworkListingFilterControl,
    GenericFilterControl,
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
import { clamp } from "../../Utilities";

export class MappingFileView {

    /**
     * A function that unwraps `this` from a reactive context.
     */
    public static toRaw: <T>(obj: T) => T = obj => obj;

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
     * The view's breakout section objects.
     */
    private _sectionObjects: Map<string, BreakoutSectionView>

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
     * The view's internal maximum layer.
     */
    private _maxLayer: number;

    /**
     * The view's internal selected {@link MappingFileViewItem}s.
     */
    private readonly _selected: Set<string>;

    /**
     * The view's internal last selected {@link MappingFileViewItem}.
     */
    private _lastSelected: MappingFileViewItem | null;

    /**
     * The view's mapping file.
     */
    public readonly file: MappingFile;

    /**
     * The view's available breakouts.
     */
    public readonly breakouts: BreakoutControl;

    /**
     * The view's available filter sets.
     */
    public readonly filterSets: ReadonlyMap<MappingObjectDiscriminator, FilterControl>;

    /**
     * The view's visible view items.
     */
    public visibleItems: ReadonlyArray<MappingFileViewItem>;


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
     * The view's maximum position (in pixels).
     */
    public get maxPosition(): number {
        return Math.max(0, this._contentHeight - this._viewHeight); 
    }

    /**
     * The view's maximum level.
     */
    public get maxLevel(): number {
        return this._maxLevel;
    }

    /**
     * The view's maximum layer.
     */
    public get maxLayer(): number {
        return this._maxLayer;
    }

    /**
     * The view's selected {@link MappingFileViewItem}s.
     */
    public get selected(): ReadonlySet<string> {
        return this._selected;
    }

    /**
     * The view's last selected {@link MappingFileViewItem}.
     */
    public get lastSelected(): MappingFileViewItem | null {
        return this._lastSelected;
    }


    /**
     * Creates a new {@link MappingFileView}.
     * @param file
     *  The view's mapping file.
     * @param sizing
     *  The view's sizing configuration.
     */
    constructor(
        file: MappingFile,
        sizing: SizingConfiguration
    ) {
        this._sizing = sizing;
        this._rootItem = null;
        this._mappingObjects = new Map();
        this._sectionObjects = new Map();
        this._discriminatorIndex = new Map();
        this._viewHeight = 0;
        this._contentHeight = 0;
        this._viewPosition = 0;
        this._maxLevel = 0;
        this._maxLayer = 0;
        this._selected = new Set();
        this._lastSelected = null;
        this.file = file;
        this.breakouts = this.defineBreakouts();
        this.filterSets = this.defineFilterSets(file);
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
     */
    public rebuildBreakouts() {

        const discriminatorIndex: DiscriminatorIndex = new Map();
        const rawThis = MappingFileView.toRaw(this);

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
        rawThis._sectionObjects = new Map();

        // 2. Breakout only by items, if applicable
        const dis = rawThis.breakouts.primaryBreakout;
        if(dis === undefined) {

            // 3a. Build items list
            let firstItem: MappingObjectView | null = null;
            let lastItem: MappingObjectView | null = null;
            for(const nextItem of rawThis._mappingObjects.values()) {
                // Filter object
                if(!rawThis.isMappingObjectVisible(nextItem.object)) {
                    // Unselect filtered objects
                    nextItem.select(false);
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

            // 3b. Set penultimate level
            this._maxLevel = 0;

            // 3c. Update root item
            this._rootItem = firstItem; 

        } else {

            // 3a. Build primary breakout
            const values = rawThis.getAllDiscriminatorValues(this.file, dis);
            for(const value of values) {
                // Check if section is filtered
                if(!rawThis.isDiscriminatorValueVisible(value, dis)) {
                    continue;
                }
                // Create view
                rawThis.getClosestViewFromDiscriminatorValueSet(
                    discriminatorIndex, [dis], rawThis._sectionObjects, [value]
                );
            }

            // 3b. Build secondary breakouts
            const activeDiscriminators = rawThis.breakouts.activeBreakouts;
            for(const objectView of rawThis._mappingObjects.values()) {
                // Filter object
                if(!rawThis.isMappingObjectVisible(objectView.object)) {
                    // Unselect filtered objects
                    objectView.select(false);
                    continue;
                }
                // Get discriminator values
                const values = activeDiscriminators.map(
                    d => rawThis.getDiscriminatorProperty(objectView.object, d)
                )
                // Get section view
                const sectionView = rawThis.getClosestViewFromDiscriminatorValueSet(
                    discriminatorIndex, activeDiscriminators, rawThis._sectionObjects, values
                )
                // If section view is uncollapsed...
                if(!sectionView.collapsed) {
                    // ...update object view level
                    objectView.level = sectionView.level + 1;
                    // Insert object view into section view
                    objectView.insertAtEndOf(sectionView);
                } else {
                    // Unselect collapsed objects
                    objectView.select(false);
                }
            }

            // 3c. Sort discriminator index
            rawThis.sortDiscriminatorIndex(discriminatorIndex);

            // 3d. Link all sections
            rawThis.linkDiscriminatorIndex(discriminatorIndex);

            // 3e. Update discriminator index
            rawThis._discriminatorIndex = discriminatorIndex;

            // 3f. Set maximum level
            this._maxLevel = [...rawThis.breakouts.options.values()]
                .reduce((a,b) => a + (b.enabled ? 1 : 0), 0);

            // 3g. Configure root item
            this._rootItem = this._discriminatorIndex
                // Get first section index
                .values().next().value
                // Try to get first section
                ?.values().next().value
                // Try to get first section view
                ?.view ?? null; 
        
        }

        // 4. Update selection
        let ls = null;
        this._selected.clear();
        for(const item of rawThis.getItems(o => o.selected)) {
            this._selected.add(item.id)
            ls = item;
        }
        const _ls = rawThis._lastSelected;
        if(!_ls || !rawThis._selected.has(_ls.id)) {
            this._lastSelected = ls;
        }

        // 5. Recalculate item positions
        this.recalculateViewItemPositions();

    }

    /**
     * Tests if a {@link MappingObject} is visible.
     * @param obj
     *  The {@link MappingObject} to test.
     * @returns
     *  True if the {@link MappingObject} is visible, false otherwise.
     */
    private isMappingObjectVisible(obj: MappingObject) {
        let isVisible = true;
        for(const discriminator of this.filterSets.keys()) {
            const prop = this.getDiscriminatorProperty(obj, discriminator);
            isVisible &&= this.isDiscriminatorValueVisible(prop, discriminator);
        }
        return isVisible;
    }

    /**
     * Returns a {@link MappingObjectDiscriminator}'s {@link Property} from a
     * {@link MappingObject}.
     * @param obj
     *  The {@link MappingObject}.
     * @param dis
     *  The {@link MappingObjectDiscriminator}.
     * @returns
     *  The {@link MappingObjectDiscriminator}'s {@link Property}.
     */
    private getDiscriminatorProperty(
        obj: MappingObject,
        dis: MappingObjectDiscriminator
    ): Property {
        switch(dis) {
            case MappingObjectDiscriminator.MappingType:
                return obj.mappingType;
            case MappingObjectDiscriminator.MappingGroup:
                return obj.mappingGroup;
            case MappingObjectDiscriminator.MappingStatus:
                return obj.mappingStatus;
            case MappingObjectDiscriminator.SourceObject:
                return obj.sourceObject;
            case MappingObjectDiscriminator.TargetObject:
                return obj.targetObject;
            case MappingObjectDiscriminator.IsValid:
                return obj.isValid;
        }
    }

    /**
     * Tests if a discriminator value is visible. 
     * @param prop
     *  The discriminator's {@link Property}.
     * @param dis
     *  The {@link MappingObjectDiscriminator}
     * @returns
     *  True if the discriminator value is visible, false otherwise.
     */
    private isDiscriminatorValueVisible(
        prop: Property,
        dis: MappingObjectDiscriminator
    ): boolean {
        const control = this.filterSets.get(dis)
        // Check if all shown first to save time
        if(!control || control.allShown()) {
            return true;
        }
        // Check if value is shown
        if(prop instanceof FrameworkObjectProperty) {
            return control.isShown(prop.objectId);
        }
        if(
            prop instanceof ListItemProperty ||
            prop instanceof ComputedProperty
        ) {
            return control.isShown(prop.value.toString());
        }
        throw new Error(
            `Cannot dereference value from '${ prop.constructor.name }'.`
        );
    }

    /**
     * Returns all possible values for a discriminator.
     * @remarks
     *  To improve efficiency, the same {@link Property} is reused and its
     *  underlying value is swapped on each iteration of the generator. Do NOT
     *  attempt to use the spread operator on this generator, simply use it in
     *  the context of an ordinary for each loop.
     * @param file
     *  The {@link MappingFile} to source the values from.
     * @param dis
     *  The {@link MappingObjectDiscriminator}.
     * @returns
     *  A {@link Property} which will contain all possible values for the
     *  discriminator.
     */
    private *getAllDiscriminatorValues(
        file: MappingFile,
        dis: MappingObjectDiscriminator
    ): Generator<Property> {
        const obj = file.createMappingObject();
        switch(dis) {
            case MappingObjectDiscriminator.MappingType:
                for(const value of file.mappingTypes.value.keys()) {
                    obj.mappingType.value = value;
                    yield obj.mappingType;
                }
                break; 
            case MappingObjectDiscriminator.MappingGroup:
                for(const value of file.mappingGroups.value.keys()) {
                    obj.mappingGroup.value = value;
                    yield obj.mappingGroup;
                }
                break;
            case MappingObjectDiscriminator.MappingStatus:
                for(const value of file.mappingStatuses.value.keys()) {
                    obj.mappingStatus.value = value;
                    yield obj.mappingStatus;
                }
                break;
            case MappingObjectDiscriminator.SourceObject:
                for(const value of file.sourceFrameworkListing.options.keys()) {
                    obj.sourceObject.objectId = value;
                    yield obj.sourceObject;
                }
                break;
            case MappingObjectDiscriminator.TargetObject:
                for(const value of file.targetFrameworkListing.options.keys()) {
                    obj.targetObject.objectId = value;
                    yield obj.targetObject;
                }
                break;
        }
    }

    /**
     * Gets the closest accessible {@link BreakoutSectionView} from a
     * discriminator index using a set of discriminator values. If the view
     * doesn't exist in the index, the function attempts to update the index
     * using a view from the {@link MappingFileView}'s existing discriminator
     * index. If neither have the view, a new one is created and added to the
     * index. In both cases, the view is added to the `sectionObjects` map.
     * @param discriminatorIndex
     *  The discriminator index.
     * @param discriminators
     *  The list of {@link MappingObjectDiscriminator}.
     * @param sectionObjects
     *  The {@link BreakoutSectionView} map.
     * @param properties
     *  The list of discriminator properties.
     * @returns
     *  The retrieved {@link BreakoutSectionView}.
     */
    private getClosestViewFromDiscriminatorValueSet(
        discriminatorIndex: DiscriminatorIndex,
        discriminators: MappingObjectDiscriminator[],
        sectionObjects: Map<string, BreakoutSectionView>,
        properties: Property[]
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
        if(discriminators.length !== properties.length) {
            throw new Error("The number of discriminators and properties must match.");
        }

        // Iterate discriminator index
        nextDiscriminatorIndex = discriminatorIndex;
        existingDiscriminatorIndex = this._discriminatorIndex;
        for(let i = 0; i < discriminators.length; i++) {
            const prop = properties[i];
            const sectionHash = this.getSectionHash(prop);
            const discriminator = discriminators[i];
            
            // Traverse next section index
            if(!nextDiscriminatorIndex.has(discriminator)) {
                nextDiscriminatorIndex.set(discriminator, new Map())
            }
            nextSectionIndex = nextDiscriminatorIndex.get(discriminator)!;
            // Traverse existing section index
            existingSectionIndex = existingDiscriminatorIndex?.get(discriminator);

            // Try to retrieve an existing section
            const existingSection: SectionInfo | undefined 
                = existingSectionIndex?.get(sectionHash)!;

            // If the next section index already has the section...
            if(nextSectionIndex.has(sectionHash)) {
                // ...use it
                nextSection = nextSectionIndex.get(sectionHash)!
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
                // Add section to map
                sectionObjects.set(nextSection.view.id, nextSection.view);
            }
            // Otherwise, create a completely new section
            else {
                nextSection = {
                    view: this.createViewFromDiscriminatorValue(prop, discriminator),
                    discriminators: new Map()
                }
                // Set level
                nextSection.view.level = i;
                // Add section to map
                sectionObjects.set(nextSection.view.id, nextSection.view);
            }
            
            // Update next section index
            nextSectionIndex.set(sectionHash, nextSection);

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
     * Returns the value of a {@link Property}.
     * @param prop
     *  The property.
     * @returns
     *  The property's value.
     */
    private getSectionHash(prop: Property): string | null {
        if(prop instanceof FrameworkObjectProperty) {
            return prop.objectId ? `${ prop.objectId }:${ prop.objectText }` : null;
        }
        if(
            prop instanceof ListItemProperty ||
            prop instanceof ComputedProperty    
        ) {
            return prop.value !== null ? `${ prop.value }` : null
        }
        throw new Error(
            `Cannot dereference value from '${ prop.constructor.name }'.`
        );
    }

    /**
     * Creates a {@link BreakoutSectionView} from a discriminator value.
     * @param value
     *  The discriminator property or value.
     * @param dis
     *  The {@link MappingObjectDiscriminator}.
     * @returns
     *  The {@link BreakoutSectionView}.
     */
    private createViewFromDiscriminatorValue(
        prop: Property,
        dis: MappingObjectDiscriminator
    ): BreakoutSectionView {
        // Configure name and value
        let value, text;
        if(prop instanceof ListItemProperty) {
            value = prop.isValueCached() ? prop.exportValue : prop.value;
            text  = prop.exportText;
        } else if (prop instanceof FrameworkObjectProperty){
            value = prop.objectId;
            text  = prop.objectText;
        } else {
            text = `Error: Unhandled Property Type '${ prop.constructor.name}'`,
            value = null
        }
        // Create section
        switch(dis) {
            case MappingObjectDiscriminator.MappingType:
                return new MappingTypeSectionView(this, value, text);
            case MappingObjectDiscriminator.MappingGroup:
                return new MappingGroupSectionView(this, value, text);
            case MappingObjectDiscriminator.MappingStatus:
                return new MappingStatusSectionView(this, value, text);
            case MappingObjectDiscriminator.SourceObject:
                return new SourceObjectSectionView(this, value, text);
            case MappingObjectDiscriminator.TargetObject:
                return new TargetObjectSectionView(this, value, text);
            default:
                throw new Error(`Unhandled Discriminator '${ dis }'.`);   
        }
    }

    /**
     * Sorts a {@link DiscriminatorIndex}.
     * @param index
     *  The {@link DiscriminatorIndex}.
     */
    private sortDiscriminatorIndex(index: DiscriminatorIndex) {
        for(const [dis, sectionIndex] of index) {
            index.set(dis, this.sortSectionIndex(sectionIndex));
            for(const section of sectionIndex.values()) {
                this.sortDiscriminatorIndex(section.discriminators);
            }
        }
    }
    
    /**
     * Sorts a {@link SectionIndex}.
     * @param index
     *  The {@link SectionIndex}.
     * @returns
     *  The sorted {@link SectionIndex}
     */
    private sortSectionIndex(index: SectionIndex): SectionIndex {
        return new Map([...index].sort((a, b) => {
            const [v1, { view: s1 }] = a;
            const [v2, { view: s2 }] = b;
            return v1 === null ? -1 : v2 === null ? 1 : s1.name.localeCompare(s2.name);
        }));
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
     */
    public recalculateViewItemPositions() {
        const rawThis = MappingFileView.toRaw(this);
        // Recalculate view item positions
        let offset = 0;
        let maxLayer = 0;
        const _sizing = rawThis._sizing;
        const sections = [];
        const sectionHeight = _sizing.sectionHeight + _sizing.sectionPaddingHeight;
        for(let item = rawThis._rootItem; item; item = item.next){
            item.headOffset = offset;
            if(item instanceof BreakoutSectionView) {
                item.layer = maxLayer++;
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
        this._maxLayer = maxLayer;
        this._contentHeight = offset;
        // Update view position
        this.setViewPosition(this._viewPosition);
    }


    ///////////////////////////////////////////////////////////////////////////
    ///  4. Manipulate View  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Selects / Unselects a {@link MappingFileViewItem}.
     * @param id
     *  The view item's id.
     * @param value
     *  True to select the item, false to unselect the item.
     */
    public setItemSelect(id: string, value: boolean): void;

    /**
     * Selects / Unselects a {@link MappingFileViewItem}.
     * @param item
     *  The view item.
     * @param value
     *  True to select the item, false to unselect the item.
     */
    public setItemSelect(item: MappingFileViewItem, value: boolean): void;
    public setItemSelect(item: MappingFileViewItem | string, value: boolean) {
        const id = typeof item === "string" ? item : item.id;
        const obj = this.getItem(id);
        // Flag the selection
        if(value) {
            this._selected.add(id);
            this._lastSelected = obj;
        } else {
            this._selected.delete(id);
            if(this._lastSelected?.id === id) {
                this._lastSelected = null;
            }
        }
        // Set the selection 
        if(obj.selected !== value) {
            obj.select(value, false);
        }
    }

    /**
     * Selects / Unselects all view items.
     * @param value
     *  True to select the item, false to unselect the item.
     */
    public setAllItemsSelect(value: boolean): void;
    
    /**
     * Selects / Unselects all view items that match the predicate.
     * @param value
     *  True to select the item, false to unselect the item.
     * @param predicate
     *  The predicate to execute on each item.
     */
    public setAllItemsSelect(value: boolean, predicate: (item: MappingFileViewItem) => boolean): void;
    public setAllItemsSelect(value: boolean, predicate: (item: MappingFileViewItem) => boolean = () => true) {
        const rawThis = MappingFileView.toRaw(this);
        if(!value) {
            for(const id of rawThis.selected) {
                const _mo = rawThis._mappingObjects;
                const _so = rawThis._sectionObjects;
                const item = (_mo.get(id) ?? _so.get(id))!
                if(predicate(item)) {
                    this.setItemSelect(item, false);
                }
            }
        } else {
            for(const item of rawThis.getItems()) {
                if(predicate(item)) {
                    this.setItemSelect(item, true);
                }
            }
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
        for(; item; item = item.next) {
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
        // Round position
        position = Math.round(position);
        // Update position
        this._viewPosition = clamp(position, 0, this.maxPosition);
        // Update visible elements
        this.updateVisibleItems();
    }

    /**
     * Updates the set of visible items.
     */
    private updateVisibleItems() {
        const rawThis = MappingFileView.toRaw(this);
        const margin = this._sizing.loadMargin;
        const topBoundary = this._viewPosition - margin;
        const botBoundary = this._viewPosition + this._viewHeight + margin;
        this.visibleItems = [...rawThis.getItemsVisibleAt(topBoundary, botBoundary)]
    }


    ///////////////////////////////////////////////////////////////////////////
    ///  5. Query View  ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * Returns a view item.
     * @param id
     *  The {@link MappingFileViewItem}'s id.
     * @returns
     *  The view item.
     */
    public getItem(id: string): MappingFileViewItem {
        const obj = this._mappingObjects.get(id) ?? this._sectionObjects.get(id);
        if(!obj) {
            throw Error(`'${ id }' does not exist within the file view.`);
        }
        return obj;
    }

    /**
     * Returns all view items.
     * @returns
     *  All view items.
     */
    public getItems(): Generator<MappingFileViewItem>;

    /**
     * Returns all view items that match the predicate.
     * @param predicate 
     *  The predicate to execute on each item.
     * @returns
     *  All view items that match the predicate.
     */
    public getItems(predicate: (item: MappingFileViewItem) => boolean): Generator<MappingFileViewItem>;
    public *getItems(predicate: (item: MappingFileViewItem) => boolean = () => true): Generator<MappingFileViewItem> {
        for(let item = this._rootItem; item; item = item.next) {
            if(predicate(item)){
                yield item;
            }
        }
    }

    /**
     * Returns all view items that overlap the specified region.
     * @param beg
     *  The region's start (in pixels).
     * @param end
     *  The region's end (in pixels).
     * @returns
     *  The view items that overlap the specified region.
     */
    public *getItemsAt(beg: number, end: number): Generator<MappingFileViewItem> {
        let encounteredBeg = false;
        let encounteredEnd = false;
        for(let item = this._rootItem; item; item = item.next) {
            const ordinalBaseOffset = item.headOffset + item.height + item.padding;
            if(item.headOffset < end && beg < ordinalBaseOffset) {
                encounteredBeg = true;
                yield item;
            } else if(encounteredBeg) {
                encounteredEnd = true;
            }
            if(encounteredBeg && encounteredEnd) {
                break;
            }
        }
    }

    /**
     * Returns all view items that appear in the specified region.
     * @param beg
     *  The region's start (in pixels).
     * @param end
     *  The region's end (in pixels).
     * @returns
     *  The view items that appear in the specified region.
     */
    public *getItemsVisibleAt(beg: number, end: number): Generator<MappingFileViewItem> {
        let encounteredBeg = false;
        let encounteredEnd = false;
        for(let item = this._rootItem; item; item = item.next) {
            if(item instanceof BreakoutSectionView) {
                if(item.headOffset < end && beg < item.baseOffset) {
                    yield item;
                }
            } else if(item instanceof MappingObjectView) {
                if(item.headOffset < end && beg < item.baseOffset) {
                    encounteredBeg = true;
                    yield item;
                } else if(encounteredBeg) {
                    encounteredEnd = true;
                }
            }
            if(encounteredBeg && encounteredEnd) {
                break;
            }
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    ///  6. Define Breakouts and Filter Sets  /////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Defines the view's breakouts.
     * @returns
     *  The view's breakouts.
     */
    private defineBreakouts(): BreakoutControl {
        return new BreakoutControl(
            this, 
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
                new ListPropertyFilterControl(this, "name", file.mappingGroups)
            ],
            [
                MappingObjectDiscriminator.MappingStatus,
                new ListPropertyFilterControl(this, "name", file.mappingStatuses)
            ],
            [
                MappingObjectDiscriminator.MappingType,
                new ListPropertyFilterControl(this, "name", file.mappingTypes)
            ],
            [
                MappingObjectDiscriminator.SourceObject,
                new FrameworkListingFilterControl(this, file.sourceFrameworkListing)
            ],
            [
                MappingObjectDiscriminator.TargetObject,
                new FrameworkListingFilterControl(this, file.targetFrameworkListing)
            ],
            [
                MappingObjectDiscriminator.IsValid,
                new GenericFilterControl(this, new Map([
                    ["true", "Valid"],
                    ["false", "Invalid"]
                ]))
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
