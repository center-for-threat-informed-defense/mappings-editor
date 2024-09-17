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
     * The framework listing reference count.
     */
    private readonly _references: Map<string | null, number>;

    /**
     * The framework listing.
     */
    public get options(): ReadonlyMap<string | null, string | null> {
        return this._options;
    }

    /**
     * The framework listing's current coverage.
     */
    public get coverage(): number {
        return this._references.size / (this._options.size - 1);
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
        this._references = new Map();
    }

    /**
     * Pivots a framework object reference.
     * @param nextId
     *  The object's new id.
     *  (`null` if it should not have a next id.)
     * @param prevId
     *  The object's previous id.
     *  (`null` if it did not have a previous id.)
     */
    public pivotReference(nextId: string | null, prevId: string | null) {
        if(nextId === prevId) {
            return;
        }
        const prev = this._references.get(prevId);
        if(prev !== undefined) {
            if(prev === 1) {
                this._references.delete(prevId);
            } else {
                this._references.set(prevId, prev - 1);
            }
        }
        if(nextId !== null) {
            const next = this._references.get(nextId);
            if(next === undefined) {
                this._references.set(nextId, 1);
            } else {
                this._references.set(nextId, next + 1);
            }
        }
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
