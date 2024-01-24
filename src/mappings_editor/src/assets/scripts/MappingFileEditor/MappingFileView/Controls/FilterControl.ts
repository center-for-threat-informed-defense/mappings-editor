import type { MappingFileView } from "..";

export abstract class FilterControl {

    /**
     * The control's internal applied filters.
     */
    protected _appliedFilters: Set<string | null>;
    
    /**
     * The control's {@link MappingFileView}.
     */
    public readonly fileView: MappingFileView;


    /**
     * The control's set of valid options.
     */
    public abstract get options(): ReadonlyMap<string | null, string>;

    /**
     * The control's number of valid options.
     */
    public abstract get size(): number;

    /**
     * The control's applied filters. 
     */
    public get appliedFilters(): ReadonlySet<string | null> {
        return this._appliedFilters;
    }


    /**
     * Creates a new {@link FilterControl}.
     * @param fileView
     *  The control's {@link MappingFileView}.
     */
    constructor(fileView: MappingFileView) {
        this.fileView = fileView;
        this._appliedFilters = new Set();
    }


    /**
     * Show all items.
     */
    public showAll() {
        this._appliedFilters.clear();
    }

    /**
     * Show all items with the specified value.
     * @param value
     *  The filter value.
     */
    public show(value: string | null) {
        this._appliedFilters.add(value);
        if(this._appliedFilters.size === this.size) {
            this._appliedFilters.clear();
        }
    }

    /**
     * Hides all items with the specified value.
     * @param value
     *  The filter value.
     */
    public hide(value: string | null) {
        this._appliedFilters.delete(value);
    }
    
    /**
     * Tests if items with the specified value are shown.
     * @param value
     *  The filter value.
     * @returns
     *  True if items with the specified value are shown, false otherwise.
     */
    public isShown(value: string | null) {
        if(this.allShown()) {
            return true;
        }
        return this._appliedFilters.has(value);
    }

    /**
     * Tests if all items are shown.
     * @returns
     *  True if all items are shown, false otherwise.
     */
    public allShown(): boolean {
        return this._appliedFilters.size === 0;
    }

}
