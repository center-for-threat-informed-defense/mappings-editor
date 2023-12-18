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
     * True if the item is selected, false otherwise.
     */
    public selected: boolean;
    
    /**
     * The mapping file view the item belongs to.
     */
    public readonly fileView: MappingFileView;


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
        this.selected = false;
        this.headOffset = 0;
        this.height = 0;
        this.padding = 0;
        this.baseOffset = 0;
        this.level = 0;
        this.layer = 0;
        this.fileView = file;
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

}
