import type { MappingFileView } from "..";

export abstract class MappingFileViewItem {

    /**
     * The previous {@link MappingFileViewItem} in the list.
     */
    public prev: MappingFileViewItem | null;

    /**
     * The next {@link MappingFileViewItem} in the list.
     */
    public next: MappingFileViewItem | null;

    /**
     * The item's head offset.
     */
    public headOffset: number;

    /**
     * The item's height.
     */
    public height: number;

    /**
     * The item's (bottom) padding.
     */
    public padding: number;

    /**
     * The item's base offset.
     */
    public baseOffset: number;

    /**
     * The item's level.
     */
    public level: number;

    /**
     * The item's layer.
     */
    public layer: number;

    /**
     * True if the item is collapsed, false otherwise.
     */
    public collapsed: boolean;

    /**
     * The mapping file view the item belongs to.
     */
    public readonly fileView: MappingFileView;
    
    /**
     * The item's internal select state.
     */
    private _selected: boolean;

    /**
     * The item's select state.
     */
    public get selected(): boolean {
        return this._selected;
    }

    /**
     * The item's id.
     */
    abstract get id(): string;


    /**
     * Creates a new {@link MappingFileViewItem}.
     * @param file
     *  The mapping file view the item belongs to.
     */
    constructor(file: MappingFileView){
        this.prev = null;
        this.next = null;
        this.collapsed = false;
        this.headOffset = 0;
        this.height = 0;
        this.padding = 0;
        this.baseOffset = 0;
        this.level = 0;
        this.layer = 0;
        this.fileView = file;
        this._selected = false;
    }
    

    /**
     * Selects / Unselects the {@link MappingFileViewItem}.
     * @param value
     *  True to select the item, false to unselect the item.
     */
    public select(value: boolean): void;

    /**
     * Selects / Unselects the {@link MappingFileViewItem}.
     * @param value
     *  True to select the item, false to unselect the item.
     * @param registerWithView
     *  If the selection should be registered with the parent 
     *  {@link MappingFileView}.
     *  (Default: true)
     */
    public select(value: boolean, registerWithView?: boolean): void;
    public select(value: boolean, registerWithView: boolean = true) {
        // Set the selection
        this._selected = value;
        // Flag the selection
        if(registerWithView) {
            this.fileView.setItemSelect(this, value);
        }
    }

    /**
     * Inserts this {@link MappingFileViewItem} before the provided item.
     * @param item
     *  The item.
     */
    public insertBefore(item: MappingFileViewItem) {
        if(item.prev) {
            item.prev.next = this;
        }
        this.prev = item.prev;
        item.prev = this;
        this.next = item;
    }

    /**
     * Inserts this {@link MappingFileViewItem} after the provided item.
     * @param item
     *  The item.
     */
    public insertAfter(item: MappingFileViewItem) {
        if(item.next) {
            item.next.prev = this;
        }
        this.next = item.next;
        item.next = this;
        this.prev = item;
    }

    /**
     * Inserts this {@link MappingFileViewItem} at the end of the provided
     * item's chain.
     * @remarks
     *  This function does not currently account for cycles in the list.
     * @param item
     *  The item.
     */
    public insertAtEndOf(item: MappingFileViewItem) {
        this.insertAfter(item.getLastItem());
    }

    /**
     * Inserts this {@link MappingFileViewItem} at the start of the provided
     * item's chain.
     * @remarks
     *  This function does not currently account for cycles in the list.
     * @param item
     *  The item.
     */
    public insertAtStartOf(item: MappingFileViewItem) {
        this.insertBefore(item.getFirstItem());
    }

    /**
     * Returns the last {@link MappingFileViewItem} in the list.
     * @remarks
     *  This function does not currently account for cycles in the list.
     * @returns
     *  The last {@link MappingFileViewItem} in the list.
     */
    public getLastItem(): MappingFileViewItem {
        let lastItem: MappingFileViewItem = this;
        while(lastItem.next !== null) {
            lastItem = lastItem.next;
        }
        return lastItem;
    }

    /**
     * Returns the first {@link MappingFileViewItem} in the list.
     * @remarks
     *  This function does not currently account for cycles in the list.
     * @returns
     *  The first {@link MappingFileViewItem} in the list.
     */
    public getFirstItem(): MappingFileViewItem {
        let firstItem: MappingFileViewItem = this;
        while(firstItem.prev !== null) {
            firstItem = firstItem.prev;
        }
        return firstItem;
    }

    /**
     * Removes this {@link MappingFileViewItem} from the list.
     */
    public removeItem(){ 
        if(this.prev) {
            this.prev.next = this.next;
        }
        if(this.next) {
            this.next.prev = this.prev;
        }
        this.prev = null;
        this.next = null;
    }

    /**
     * Returns all {@link MappingFileViewItem}s before and including this one.
     * @returns
     *  All {@link MappingFileViewItem}s before and including this one.
     */
    public *traverseItemsBefore(): Generator<MappingFileViewItem> {
        type Item = MappingFileViewItem | null;
        for(let obj: Item = this; obj !== null; obj = obj.prev) {
            yield obj;
        }
    }

    /**
     * Returns all {@link MappingFileViewItem}s after and including this one.
     * @returns
     *  All {@link MappingFileViewItem}s after and including this one.
     */
    public *traverseItemsAfter(): Generator<MappingFileViewItem> {
        type Item = MappingFileViewItem | null;
        for(let obj: Item = this; obj !== null; obj = obj.next) {
            yield obj;
        }
    }

    /**
     * Returns the {@link MappingFileViewItem} hierarchy. The item hierarchy
     * begins at this item and successively jumps to the next highest item 
     * (by level) until an item at level 0 is reached.
     * @remarks
     *  For example, if an item was at level 2, this function would return:
     *  - The first item encountered at level 2. (This one)
     *  - The first item encountered at level 1. (Traveling upwards)
     *  - The first item encountered at level 0. (Traveling upwards)
     * @returns
     *  The {@link MappingFileViewItem} hierarchy.
     */
    public *traverseItemHierarchy(): Generator<MappingFileViewItem> {
        let nextLevel = null;
        for(let obj: MappingFileViewItem = this; obj; obj = obj.prev!) {
            const isNextLevel = nextLevel === null || nextLevel === obj.level;
            if(isNextLevel) {
                nextLevel = obj.level - 1;
                yield obj;
            }
            if(nextLevel === -1) { 
                break;
            }
        }
    }

}
