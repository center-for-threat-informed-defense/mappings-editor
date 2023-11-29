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
     * @param objectFramework
     *  The framework object's framework.
     * @param objectVersion
     *  The framework object's framework version.
     */
    constructor(objectFramework: string, objectVersion: string) {
        super(objectFramework, objectVersion);
        this._objectId = null;
        this._objectText = null;
    }


    /**
     * Forcibly sets the framework object's value.
     * @param id 
     *  The framework object's id.
     * @param text
     *  The framework object's text.
     * @param frameworkVersion
     *  The framework's version.
     */
    public forceSet(id: string | null, text: string | null, version: string) {
        this._objectId = id;
        this._objectText = text;
        this._objectVersion = version;
    }

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.s
     */
    public duplicate(): FreeFrameworkObjectProperty {
        const duplicate = new FreeFrameworkObjectProperty(this.objectFramework, this.objectVersion);
        duplicate.forceSet(this.objectId, this.objectText, this.objectVersion);
        return duplicate;
    }

}
