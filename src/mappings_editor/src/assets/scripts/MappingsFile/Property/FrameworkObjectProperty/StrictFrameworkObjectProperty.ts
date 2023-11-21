import type { EditableStrictFrameworkListing } from "./EditableStrictFrameworkListing";
import { FrameworkObjectProperty } from "./FrameworkObjectProperty";

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
    public readonly framework: EditableStrictFrameworkListing;


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
        if(value === null) {
            this._objectId = null;
            return;
        }
        if(this.framework.options.has(value)) {
            this._objectId = value;
            this._objectText = this.framework.options.get(value)!;
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
     * @param name
     *  The property's name.
     * @param listing
     *  The property's framework listing.
     */
    constructor(name: string, listing: EditableStrictFrameworkListing) {
        super(name);
        this._objectId = null;
        this._objectText = null;
        this.framework = listing;
    }


    /**
     * Forcibly sets the framework object's id.
     * @param id 
     *  The framework object's id.
     */
    public forceSetObjectId(id: string | null): void {
        this._objectId = id;
    }

    /**
     * Forcibly sets the framework object's text.
     * @param text
     *  The framework object's text.
     */
    public forceSetObjectText(text: string | null): void {
        this._objectText = text;
    }

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.s
     */
    public duplicate(): StrictFrameworkObjectProperty {
        const duplicate = new StrictFrameworkObjectProperty(this.name, this.framework);
        duplicate.forceSetObjectId(this.objectId);
        duplicate.forceSetObjectText(this.objectText);
        return duplicate;
    }

}
