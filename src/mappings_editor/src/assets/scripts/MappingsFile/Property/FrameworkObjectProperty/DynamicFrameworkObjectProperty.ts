import { FrameworkObjectProperty } from "./FrameworkObjectProperty";
import type { EditableDynamicFrameworkListing } from "./EditableDynamicFrameworkListing";
import type { FrameworkListing } from ".";

export class DynamicFrameworkObjectProperty extends FrameworkObjectProperty {

    /**
     * The framework object's internal id.
     */
    private _objectId: string | null;

    /**
     * The property's internal framework listing.
     */
    public readonly _framework: EditableDynamicFrameworkListing;

    
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
    }

    /**
     * The framework object's text.
     */
    get objectText(): string | null {
        return this._framework.getListingText(this._objectId);
    }

    /**
     * The framework object text's setter.
     */
    set objectText(value: string | null) {
        this._framework.setListingText(this._objectId, value);
    }


    /**
     * Creates a new {@link DynamicFrameworkObjectProperty}.
     * @param name
     *  The property's name.
     * @param listing
     *  The property's framework listing.
     */
    constructor(name: string, listing: EditableDynamicFrameworkListing);

    /**
     * Creates a new {@link StaticFrameworkObjectProperty}.
     * @param name
     *  The property's name.
     * @param listing
     *  The property's framework listing.
     * @param value
     *  The property's value.
     */
    constructor(name: string, listing: EditableDynamicFrameworkListing) {
        super(name);
        this._objectId = null;
        this._framework = listing;
    }


    /**
     * Forcibly sets the framework object's id.
     * @param id 
     *  The framework object's id.
     */
    public forceSetObjectId(id: string | null): void {
        this.objectId = id;
    }

    /**
     * Forcibly sets the framework object's text.
     * @param text
     *  The framework object's text.
     */
    public forceSetObjectText(text: string | null): void {
        this.objectText = text;
    }

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.
     */
    public duplicate(): DynamicFrameworkObjectProperty {
        const duplicate = new DynamicFrameworkObjectProperty(this.name, this._framework);
        duplicate.forceSetObjectId(this.objectId);
        duplicate.forceSetObjectText(this.objectText);
        return duplicate;
    }

}
