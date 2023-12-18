import { FrameworkListing } from "./FrameworkListing";

export class EditableStrictFrameworkListing extends FrameworkListing {

    /**
     * The internal framework listing.
     */
    private readonly _options: Map<string | null, string | null>


    /**
     * The framework listing.
     */
    public get options(): ReadonlyMap<string | null, string | null> {
        return this._options;
    }


    /**
     * Creates a new {@link EditableStrictFrameworkListing}.
     * @param framework
     *  The framework's identifier.
     * @param version
     *  The framework's version.
     */
    constructor(framework: string, version: string) {
        super(framework, version);
        this._options = new Map([[null, null]]);
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
