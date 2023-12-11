export abstract class FilterControl {

    /**
     * The control's set of valid options.
     */
    abstract get options(): ReadonlyMap<string | null, string>;

    /**
     * The control's active filters.
     */
    protected _activeFilters: Set<string | null>;
    

    /**
     * Creates a new {@link FilterControl}.
     */
    constructor() {
        this._activeFilters = new Set();
    }


    /**
     * Show all items.
     */
    public showAll() {
        this._activeFilters.clear();
    }

    /**
     * Show all items with the specified value.
     * @param value
     *  The filter value.
     */
    public show(value: string | null) {
        this._activeFilters.add(value);
    }

    /**
     * Hides all items with the specified value.
     * @param value
     *  The filter value.
     */
    public hide(value: string | null) {
        this._activeFilters.delete(value);
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
        return this._activeFilters.has(value);
    }

    /**
     * Tests if all items are shown.
     * @returns
     *  True if all items are shown, false otherwise.
     */
    public allShown(): boolean {
        return this._activeFilters.size === 0;
    }

}
