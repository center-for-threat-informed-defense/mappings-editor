import { FrameworkListing } from "./FrameworkListing";

/**
 * An {@link EditableDynamicFrameworkListing} represents a DYNAMIC list of
 * "framework objects". Each framework object is uniquely identified by an `id`
 * and is described with `text`. A valid `id` / `text` pair exists so long as
 * it's referenced by at least one {@link DynamicFrameworkObjectProperty}.
 * Once the reference count of an `id` / `text` pair reaches 0, the pair is
 * removed from the listing. If a {@link DynamicFrameworkObjectProperty}
 * defines a completely new `id` / `text` pair, the pair is added to the
 * listing and given a reference count of 1.
 */
export class EditableDynamicFrameworkListing extends FrameworkListing {

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
     * The currently targeted framework object.
     */
    private _targetedObjectId: string | undefined;


    /**
     * The framework listing.
     */
    public get options(): ReadonlyMap<string | null, string | null> {
        return this._options;
    }

    /**
     * The framework listing's current coverage.
     */
    public get coverage(): [number, number] {
        return [this._references.size, this._options.size];
    }

    /**
     * The framework listing's object id length.
     */
    public get objectIdLength(): number {
        return this._idLength;
    }

    /**
     * The currently targeted framework object.
     */
    public get targetedObjectId(): string | null | undefined {
        return this._targetedObjectId;
    }

    /**
     * The currently targeted framework object's setter.
     */
    public set targetedObjectId(value: string | undefined) {
        if(value === undefined) {
            this._targetedObjectId = undefined;
        } else if(this._options.has(value)) {
            this._targetedObjectId = value;
        } else {
            throw new Error(`Cannot target non-existent object id '${ value }'.`)
        }
    }


    /**
     * Creates a new {@link EditableDynamicFrameworkListing}.
     * @param framework
     *  The framework's identifier.
     * @param version
     *  The framework's version.
     */
    constructor(framework: string, version: string) {
        super(framework, version);
        this._options = new Map([[null, null]]);
        this._references = new Map([[null, Infinity]]);
        this._idLength = FrameworkListing.DEFAULT_OBJ_ID_LEN;
        this._targetedObjectId = undefined;
    }


    /**
     * Switches into a framework object by id.
     * @param nextId
     *  The object's new id.
     *  (`null` if it should not have a next id.)
     * @param prevId
     *  The object's previous id.
     *  (`null` if it did not have a previous id.)
     * @returns
     *  The object's new id.
     */
    public switchListingId(nextId: string | null, prevId: string | null): string | null {
        if(nextId === prevId) {
            return nextId;
        }
        // If next object doesn't exists...
        if(!this._options.has(nextId)) {
            // ...define the object
            let objectText = null;
            // If the previous object had text...
            if(prevId && this._options.has(prevId)){
                // ...copy it to the new object
                objectText = this._options.get(prevId)!;
            }
            this._options.set(nextId, objectText);
            this._references.set(nextId, 0);
            // Update id length
            const idLength = nextId?.length ?? FrameworkListing.DEFAULT_OBJ_ID_LEN;
            this._idLength = Math.max(this._idLength, idLength);
        }

        // Increment the object's reference count
        this._references.set(nextId, this._references.get(nextId)! + 1);

        // If previous object id exists...
        if(this._options.has(prevId)) {
            // ...decrement its reference count
            this._references.set(prevId, this._references.get(prevId)! - 1);
            // If nothing references object anymore...
            if(this._references.get(prevId) === 0) {
                // ...delete it.
                this._options.delete(prevId);
                this._references.delete(prevId);
                // Update id length
                this._idLength = [...this._options.keys()].reduce(
                    (a,b) => Math.max(a, b?.length ?? 0),
                    FrameworkListing.DEFAULT_OBJ_ID_LEN
                );
            }
        }

        // Return the listing id
        return nextId;
    }

    /**
     * Sets a framework object's text.
     * @param id
     *  The object's id.
     * @param text
     *  The object's text.
     */
    public setListingText(id: string | null, text: string | null) {
        if(id === null) {
            return;
        }
        if(this._options.has(id)) {
            this._options.set(id, text);
        } else {
            throw new Error(`Framework object '${ id }' does not exist.`);
        }
    }

    /**
     * Returns a framework object's text.
     * @param id
     *  The object's id.
     * @returns
     *  The object's text.
     */
    public getListingText(id: string | null): string | null {
        if(id === null) {
            return null;
        }
        if(this._options.has(id)) {
            return this._options.get(id)!;
        } else {
            throw new Error(`Framework object '${ id }' does not exist.`)
        }
    }

    /**
     * Returns the number of times a framework object's id is referenced.
     * @param id
     *  The object's id.
     * @returns
     *  The number of times the object's id is referenced.
     */
    public getReferenceCount(id: string | null): number {
        return this._references.get(id) ?? 0;
    }

}
