import { clamp } from "../Utilities";
import { Reactivity } from "./Reactivity";
import { BreakoutControl } from "./ViewControls";
import {
    Property,
    ListItemProperty,
    FrameworkObjectProperty,
    ComputedProperty
} from "../MappingFile";
import {
    MappingFileViewItem,
    CapabilityGroupSectionView,
    MappingObjectView,
    MappingStatusSectionView,
    MappingTypeSectionView,
    BreakoutSectionView,
    SourceObjectSectionView,
    TargetObjectSectionView
} from "./ViewItems";
import type { ViewFilter } from "./ViewFilter";
import type { MappingFile } from "../MappingFile";
import type { MappingObjectPropertyKey } from "./MappingObjectPropertyKey";

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
     * The view's breakout section objects.
     */
    private _sectionObjects: Map<string, BreakoutSectionView>

    /**
     * The view's section index.
     */
    private _sectionIndex: SectionIndex;

    /**
     * The view's internal filters.
     */
    private _viewFilters: Map<string, ViewFilter>;

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
    public readonly breakouts: BreakoutControl<MappingObjectPropertyKey>;

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
     * The view's filters.
     */
    public get viewFilters(): ReadonlyMap<string, ViewFilter> {
        return this._viewFilters;
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
        this._sectionIndex = new Map();
        this._viewFilters = new Map();
        this._viewHeight = 0;
        this._contentHeight = 0;
        this._viewPosition = 0;
        this._maxLevel = 0;
        this._maxLayer = 0;
        this._selected = new Set();
        this._lastSelected = null;
        this.file = file;
        this.breakouts = this.defineBreakouts();
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
        const rawThis = Reactivity.toRaw(this);
        const viewFilters = [...rawThis._viewFilters.values()];

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
        const key = rawThis.breakouts.primaryBreakout;
        if(key === undefined) {

            // 3a. Build items list
            let firstItem: MappingObjectView | null = null;
            let lastItem: MappingObjectView | null = null;
            for(const nextItem of rawThis._mappingObjects.values()) {
                // Filter object
                if(!viewFilters.every(v => v.isObjectVisible(nextItem.object))) {
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
            const sectionIndex = new Map();

            // 3a. Build primary breakout
            const values = rawThis.getAllPropertyValues(this.file, key);
            for(const value of values) {
                // Check if section is filtered
                if(!viewFilters.every(f => f.isPropertyVisible(key, value))) {
                    continue;
                }
                // Create view
                rawThis.getClosestBreakoutSectionView(
                    sectionIndex, [key], [value], rawThis._sectionObjects,
                );
            }

            // 3b. Build secondary breakouts
            const activeBreakoutKeys = rawThis.breakouts.activeBreakouts;
            for(const objectView of rawThis._mappingObjects.values()) {
                // Filter object
                if(!viewFilters.every(v => v.isObjectVisible(objectView.object))) {
                    // Unselect filtered objects
                    objectView.select(false);
                    continue;
                }
                // Get breakout properties
                const activeBreakoutProperties = activeBreakoutKeys.map(
                    d => objectView.object[d]
                )
                // Get section view
                const sectionView = rawThis.getClosestBreakoutSectionView(
                    sectionIndex,
                    activeBreakoutKeys,
                    activeBreakoutProperties,
                    rawThis._sectionObjects
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

            // 3c. Sort section index
            rawThis.sortSectionIndex(sectionIndex);

            // 3d. Link all sections
            rawThis.linkItemsInSectionIndex(sectionIndex);

            // 3e. Update section index
            rawThis._sectionIndex = sectionIndex;

            // 3f. Set maximum level
            this._maxLevel = [...rawThis.breakouts.options.values()]
                .reduce((a,b) => a + (b.enabled ? 1 : 0), 0);

            // 3g. Configure root item
            this._rootItem = this._sectionIndex
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
     * Returns all possible values of a Property from a Mapping File.
     * @remarks
     *  To improve efficiency, the same {@link Property} is reused and its
     *  underlying value is swapped on each iteration of the generator. Do NOT
     *  attempt to use the spread operator on this generator, simply use it in
     *  the context of an ordinary for each loop.
     * @param file
     *  The {@link MappingFile} to source the values from.
     * @param key
     *  The {@link MappingObjectPropertyKey}.
     * @returns
     *  A generator that renders all possible values for a {@link Property}.
     */
    private *getAllPropertyValues(
        file: MappingFile,
        key: MappingObjectPropertyKey
    ): Generator<Property> {
        const obj = file.createMappingObject();
        switch(key) {
            case "capabilityGroup":
                for(const value of file.capabilityGroups.value.keys()) {
                    obj.capabilityGroup.value = value;
                    yield obj.capabilityGroup;
                }
                break;
            case "mappingType":
                for(const value of file.mappingTypes.value.keys()) {
                    obj.mappingType.value = value;
                    yield obj.mappingType;
                }
                break;
            case "mappingStatus":
                for(const value of file.mappingStatuses.value.keys()) {
                    obj.mappingStatus.value = value;
                    yield obj.mappingStatus;
                }
                break;
            case "sourceObject":
                for(const value of file.sourceFrameworkListing.options.keys()) {
                    obj.sourceObject.objectId = value;
                    yield obj.sourceObject;
                }
                break;
            case "targetObject":
                for(const value of file.targetFrameworkListing.options.keys()) {
                    obj.targetObject.objectId = value;
                    yield obj.targetObject;
                }
                break;
            default:
                throw new Error(`Cannot enumerate values of '${key}'.`);
        }
    }

    /**
     * Gets the closest accessible {@link BreakoutSectionView} from a
     * {@link SectionIndex}. If the view doesn't exist in the index, the
     * function attempts to update the index using a view from the
     * {@link MappingFileView}'s existing section index. If neither have the
     * view, a new one is created and added to the index. In both cases, the
     * view is added to the `sectionObjects` map.
     * @param sections
     *  The section index to traverse.
     * @param keys
     *  The list of section property keys.
     * @param properties
     *  The list of section properties.
     * @param sectionObjects
     *  The {@link BreakoutSectionView} map.
     * @returns
     *  The retrieved {@link BreakoutSectionView}.
     */
    private getClosestBreakoutSectionView(
        sections: SectionIndex,
        keys: MappingObjectPropertyKey[],
        properties: Property[],
        sectionObjects: Map<string, BreakoutSectionView>,
    ): BreakoutSectionView {
        let nextSection: SectionInfo | undefined;
        let nextSectionIndex: SectionIndex;
        let existingSectionIndex: SectionIndex;

        // Validate keys exist
        if(keys.length === 0) {
            throw new Error("At least one property key must be specified.");
        }
        // Validate keys and properties align
        if(keys.length !== properties.length) {
            throw new Error("The number of keys and properties must match.");
        }

        // Iterate property key index
        nextSectionIndex = sections;
        existingSectionIndex = this._sectionIndex;
        for(let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const prop = properties[i];
            const sectionHash = this.getSectionHash(prop);

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
                    subsections: new Map()
                }
                // Add section to map
                sectionObjects.set(nextSection.view.id, nextSection.view);
            }
            // Otherwise, create a completely new section
            else {
                nextSection = {
                    view: this.createSectionViewFromProperty(key, prop),
                    subsections: new Map()
                }
                // Set level
                nextSection.view.level = i;
                // Add section to map
                sectionObjects.set(nextSection.view.id, nextSection.view);
            }

            // Update next section index
            nextSectionIndex.set(sectionHash, nextSection);

            // Traverse next section index
            nextSectionIndex = nextSection.subsections
            // Traverse existing section index
            existingSectionIndex = existingSection?.subsections;

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
     * Creates a {@link BreakoutSectionView} from a {@link Property}.
     * @param propertyKey
     *  The property's key.
     * @param property
     *  The property.
     * @returns
     *  The {@link BreakoutSectionView}.
     */
    private createSectionViewFromProperty(
        propertyKey: MappingObjectPropertyKey,
        property: Property
    ): BreakoutSectionView {
        // Configure name and value
        let value, text;
        if(property instanceof ListItemProperty) {
            value = property.isValueCached() ? property.exportValue : property.value;
            text  = property.exportText;
        } else if (property instanceof FrameworkObjectProperty){
            value = property.objectId;
            text  = property.objectText;
        } else {
            text = `Error: Unhandled Property Type '${ property.constructor.name}'`,
            value = null
        }
        // Create section
        switch(propertyKey) {
            case "capabilityGroup":
                return new CapabilityGroupSectionView(this, value, text);
            case "mappingType":
                return new MappingTypeSectionView(this, value, text);
            case "mappingStatus":
                return new MappingStatusSectionView(this, value, text);
            case "sourceObject":
                return new SourceObjectSectionView(this, value, text);
            case "targetObject":
                return new TargetObjectSectionView(this, value, text);
            default:
                throw new Error(`Unhandled Key '${ propertyKey }'.`);
        }
    }

    /**
     * Sorts a {@link SectionIndex} in-place.
     * @param index
     *  The {@link SectionIndex}.
     */
    private sortSectionIndex(index: SectionIndex) {
        // Sort index
        const entries = [...index].sort((a, b) => {
            const [v1, { view: s1 }] = a;
            const [v2, { view: s2 }] = b;
            if(v1 === null) {
                return -1;
            }
            if(v2 === null) {
                return 1;
            }
            return s1.name.localeCompare(s2.name);
        })
        // Clear index
        index.clear();
        // Add sorted entries
        for(const [hash, section] of entries) {
            index.set(hash, section);
            // Sort subsections
            this.sortSectionIndex(section.subsections);
        }
    }

    /**
     * Links the items in an unlinked {@link SectionIndex}.
     * @param index
     *  The {@link SectionIndex}.
     * @param lastItem
     *  The last encountered {@link MappingFileViewItem}.
     * @returns
     *  The last encountered {@link MappingFileViewItem}.
     */
    private linkItemsInSectionIndex(
        index: SectionIndex,
        lastItem?: MappingFileViewItem
    ): MappingFileViewItem | undefined {
        for(const section of index.values()) {
            if(lastItem) {
                lastItem.next = section.view;
                section.view.prev = lastItem;
            }
            lastItem = this.linkItemsInSectionIndex(
                section.subsections,
                section.view.getLastItem()
            );
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
        const rawThis = Reactivity.toRaw(this);
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
        const rawThis = Reactivity.toRaw(this);
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
     * Collapses / Uncollapses all view items.
     * @param value
     *  True to collapse the item, false to uncollapse the item.
     */
    public setAllItemsCollapse(value: boolean): void;

    /**
     * Collapses / Uncollapses all view items that match the predicate.
     * @param value
     *  True to collapse the item, false to uncollapse the item.
     * @param predicate
     *  The predicate to execute on each item.
     */
    public setAllItemsCollapse(value: boolean, predicate: (item: MappingFileViewItem) => boolean): void;
    public setAllItemsCollapse(value: boolean, predicate: (item: MappingFileViewItem) => boolean = () => true) {
        const rawThis = Reactivity.toRaw(this);
        for(const item of rawThis.getItems()) {
            if(predicate(item)) {
                item.collapsed = value;
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
        const rawThis = Reactivity.toRaw(this);
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
    ///  6. Define Breakouts  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Registers a {@link ViewFilter} with the view.
     * @param id
     *  The view filter's identifier.
     * @param filter
     *  The view filter.
     */
    public registerViewFilter(id: string, filter: ViewFilter) {
        this._viewFilters.set(id, filter);
    }


    ///////////////////////////////////////////////////////////////////////////
    ///  7. Define Breakouts  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Defines the view's breakouts.
     * @returns
     *  The view's breakouts.
     */
    private defineBreakouts(): BreakoutControl<MappingObjectPropertyKey> {
        return new BreakoutControl<MappingObjectPropertyKey>(
            this,
            new Map<MappingObjectPropertyKey, any>([
                [
                    "capabilityGroup",
                    { text: "Capability Group", enabled: true }
                ],
                [
                    "mappingStatus",
                    { text: "Mapping Status", enabled: true }
                ],
                [
                    "mappingType",
                    { text: "Mapping Type", enabled: false }
                ],
                [
                    "sourceObject",
                    { text: "Source", enabled: false }
                ],
                [
                    "targetObject",
                    { text: "Target", enabled: false }
                ]
            ])
        );
    }

}

/**
 * Section Index Type
 */
type SectionIndex = Map<
    null | string, SectionInfo
>;

/**
 * Section Info type
 */
type SectionInfo = {

    /**
     * The section's view.
     */
    view: BreakoutSectionView;

    /**
     * The section's sub-sections.
     */
    subsections: SectionIndex;

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
