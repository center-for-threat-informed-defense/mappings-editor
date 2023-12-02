import { FrameworkListing } from ".";
import { FrameworkObjectProperty } from "./FrameworkObjectProperty";
import type { EditableDynamicFrameworkListing } from "./EditableDynamicFrameworkListing";

export class DynamicFrameworkObjectProperty extends FrameworkObjectProperty {

    /**
     * The framework object's internal id.
     */
    private _objectId: string | null;

    /**
     * The framework object's internal text.
     */
    private _objectText: string | null; 

    /**
     * The property's internal framework listing.
     */
    private readonly _framework: EditableDynamicFrameworkListing;

    
    /**
     * The property's framework listing.
     */
    public get framework(): FrameworkListing {
        return this._framework;
    }

    /**
     * The framework object's id.
     */
    get objectId(): string | null {
        return this._objectId;
    }

    /**
     * The framework object id's setter.
     */
    set objectId(value: string | null) {
        this._objectId = this._framework.switchListingId(value, this._objectId);
        this._objectText = null;
        this._objectFramework = this._framework.id;
        this._objectVersion = this._framework.version;
    }

    /**
     * The framework object's text.
     */
    get objectText(): string | null {
        // If framework object's text is overridden...
        if(this._objectText !== null) {
            // ...return overridden text.
            return this._objectText;
        }
        // If framework object's text is not overridden...
        else {
            // ...return framework object's text.
            return this._framework.getListingText(this._objectId);
        }   
    }

    /**
     * The framework object text's setter.
     */
    set objectText(value: string | null) {
        this._framework.setListingText(this._objectId, value);
        this._objectText = null;
        this._objectFramework = this._framework.id;
        this._objectVersion = this._framework.version;
    }


    /**
     * Creates a new {@link StaticFrameworkObjectProperty}.
     * @param name
     *  The property's name.
     * @param listing
     *  The property's framework listing.
     */
    constructor(listing: EditableDynamicFrameworkListing) {
        super(listing.id, listing.version);
        this._objectId = null;
        this._objectText = null;
        this._framework = listing;
    }

    /**
     * Forcibly sets the framework object's value.
     * @param id 
     *  The framework object's id.
     * @param text
     *  The framework object's text.
     * @param framework
     *  The framework object's framework.
     * @param version
     *  The framework object's framework version.
     */
    public forceSet(id: string | null, text: string | null, framework: string, version: string): void {
        this._objectId = id;
        this._objectText = text;
        this._objectFramework = framework;
        this._objectVersion = version;
    }

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.
     */
    public duplicate(): DynamicFrameworkObjectProperty {
        const duplicate = new DynamicFrameworkObjectProperty(this._framework);
        duplicate.forceSet(
            this.objectId, this.objectText,
            this.objectFramework, this.objectVersion
        );
        return duplicate;
    }

}
