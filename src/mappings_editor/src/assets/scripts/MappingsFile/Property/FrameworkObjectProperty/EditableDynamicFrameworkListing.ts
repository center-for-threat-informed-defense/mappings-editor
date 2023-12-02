import { FrameworkListing } from "./FrameworkListing";

export class EditableDynamicFrameworkListing extends FrameworkListing {

    /**
     * The internal framework listing.
     */
    private readonly _options: Map<string | null, string | null>

    /**
     * The framework listing reference count.
     */
    private readonly _references: Map<string | null, number>


    /**
     * The framework listing.
     */
    public get options(): ReadonlyMap<string | null, string | null> {
        return this._options;
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
        this._references = new Map([[null, 1]]);
    }


    /**
     * Switches into a framework listing by object id.
     * @param nextId
     *  The framework listing's new id.
     *  (`null` if it should not have a next id.)
     * @param objectId
     *  The framework listing's previous id.
     *  (`null` if it did not have a previous id.)
     * @returns
     *  The framework listing's new id.
     */
    public switchListingId(nextId: string | null, prevId: string | null): string | null {
        // If next listing listing doesn't exists... 
        if(!this._options.has(nextId)) {
            // ...define the listing
            let objectText = null;
            if(prevId && this._options.has(prevId)){
                objectText = this._options.get(prevId)!;
            }
            this._options.set(nextId, objectText);
            this._references.set(nextId, 0);
        }
        // Increment the listing's reference count
        this._references.set(nextId, this._references.get(nextId)! + 1);
        // If previous listing id exists...
        if(this._options.has(prevId)) {
            // ...decrement its reference count
            this._references.set(prevId, this._references.get(prevId)! - 1);
            // If nothing references listing anymore...
            if(this._references.get(prevId) === 0) {
                // ...delete it.
                this._options.delete(prevId);
                this._references.delete(prevId);
            }
        }
        // Return the listing id
        return nextId;
    }
    
    /**
     * Sets a framework listing's text.
     * @param id
     *  The framework listing's id.
     * @param text
     *  The framework listing's text.
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
     * Returns a framework listing's text.
     * @param id
     *  The framework listing's id.
     * @returns
     *  The framework listing's text.
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
    
}
