import { FrameworkListing } from "./FrameworkListing";

/**
 * An {@link EditableStrictFrameworkListing} represents a STRICT list of
 * "framework objects". Each framework object is uniquely identified by an `id`
 * and is described with `text`. Each valid `id` / `text` pair is registered
 * once and remains with the listing indefinitely.
 */
export class EditableStrictFrameworkListing extends FrameworkListing {

    /**
     * The internal framework listing.
     */
    private readonly _options: Map<string | null, string | null>;

    /**
     * The internal framework listing's object id length.
     */
    private _idLength: number;

    /**
     * The framework listing.
     */
    public get options(): ReadonlyMap<string | null, string | null> {
        return this._options;
    }

    /**
     * The framework listing's object id length.
     */
    public get objectIdLength(): number {
        return this._idLength;
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
        this._idLength = FrameworkListing.DEFAULT_OBJ_ID_LEN;
    }


    /**
     * Registers a framework object.
     * @param id
     *  The framework object's id.
     * @param text
     *  The framework object's text.
     */
    public registerObject(id: string, text: string) {
        if(!this._options.has(id)) {
            this._options.set(id, text);
            this._idLength = Math.max(this._idLength, id.length);
        } else {
            throw new Error(`Framework Object '${ id }' already registered.`);
        }
    }
    
}
