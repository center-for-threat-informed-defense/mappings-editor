import { FrameworkObjectProperty } from "./FrameworkObjectProperty";
import type { FrameworkListing } from ".";
import type { EditableStrictFrameworkListing } from "./EditableStrictFrameworkListing";

export class StrictFrameworkObjectProperty extends FrameworkObjectProperty {

    /**
     * The framework object's internal id.
     */
    private _objectId: string | null;

    /**
     * The framework object's internal text.
     */
    private _objectText: string | null;

    /**
     * The property's framework listing.
     */
    private readonly _framework: EditableStrictFrameworkListing;

    
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
        if(this._framework.options.has(value)) {
            this._objectId = value;
            this._objectText = this._framework.options.get(value)!;
            this._objectFramework = this._framework.id;
            this._objectVersion = this._framework.version;
        } else {
            throw new Error(`Invalid framework object id '${ value }'.`)
        }
    }

    /**
     * The framework object's text.
     */
    get objectText(): string | null {
        return this._objectText;
    }

    /**
     * The framework object text's setter.
     */
    set objectText(_: string | null) {
        throw new Error(
            "Object text cannot be set directly, specify the 'objectId' instead."
        );
    }


    /**
     * Creates a new {@link StrictFrameworkObjectProperty}.
     * @param listing
     *  The property's framework listing.
     */
    constructor(listing: EditableStrictFrameworkListing) {
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
    public forceSet(id: string | null, text: string | null, framework: string, version: string) {
        this._objectId = id;
        this._objectText = text;
        this._objectFramework = framework;
        this._objectVersion = version;
    }

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.s
     */
    public duplicate(): StrictFrameworkObjectProperty {
        const duplicate = new StrictFrameworkObjectProperty(this._framework);
        duplicate.forceSet(
            this.objectId, this.objectText,
            this.objectFramework, this.objectVersion
        );
        return duplicate;
    }

}
