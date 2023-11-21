import type { FrameworkListing } from "./FrameworkListing";

export class EditableStrictFrameworkListing implements FrameworkListing {

    /**
     * The internal framework listing.
     */
    private readonly _options: Map<string, string>


    /**
     * The framework listing.
     */
    public get options(): ReadonlyMap<string, string> {
        return this._options;
    }


    /**
     * Creates a new {@link EditableStrictFrameworkListing}.
     */
    constructor() {
        this._options = new Map();
    }


    /**
     * Registers a framework listing.
     * @param id
     *  The framework listing's id.
     * @param text
     *  The framework listing's text.
     */
    public registerListing(id: string, text: string) {
        if(!this._options.has(id)) {
            this._options.set(id, text);
        } else {
            throw new Error(`Framework Object '${ id }' already registered.`);
        }
    }
    
}
