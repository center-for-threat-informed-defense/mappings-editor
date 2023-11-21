import { FrameworkObjectProperty } from "./FrameworkObjectProperty";

export class FreeFrameworkObjectProperty extends FrameworkObjectProperty {

    /**
     * The framework object's internal id.
     */
    private _objectId: string | null;

    /**
     * The framework object's internal text.
     */
    private _objectText: string | null;


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
        this._objectId = value;
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
    set objectText(value: string | null) {
        this._objectText = value;
    }


    /**
     * Creates a new {@link FreeFrameworkObjectProperty}.
     * @param name
     *  The property's name.
     */
    constructor(name: string) {
        super(name);
        this._objectId = null;
        this._objectText = null;
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
     *  The duplicated object property.s
     */
    public duplicate(): FreeFrameworkObjectProperty {
        const duplicate = new FreeFrameworkObjectProperty(this.name);
        duplicate.forceSetObjectId(this.objectId);
        duplicate.forceSetObjectText(this.objectText);
        return duplicate;
    }

}
