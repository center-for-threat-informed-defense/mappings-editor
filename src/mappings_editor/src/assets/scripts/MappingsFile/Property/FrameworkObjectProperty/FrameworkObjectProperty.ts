import { Property } from "../Property";

export abstract class FrameworkObjectProperty extends Property {

    /**
     * The framework object's internal framework.
     */
    protected _objectFramework: string;

    /**
     * The framework object's internal framework version.
     */
    protected _objectVersion: string;


    /**
     * The framework object's framework.
     */
    get objectFramework(): string {
        return this._objectFramework;
    }

    /**
     * The framework object's framework version.
     */
    get objectVersion(): string {
        return this._objectVersion;
    }

    /**
     * The object's id.
     */
    abstract get objectId(): string | null;

    /**
     * The framework object id's setter.
     */
    abstract set objectId(value: string | null);

    /**
     * The framework object's text.
     */
    abstract get objectText(): string | null;

    /**
     * The framework object text's setter.
     */
    abstract set objectText(value: string | null);


    /**
     * Creates a new {@link FrameworkObjectProperty}.
     * @param objectFramework
     *  The framework object's framework.
     * @param objectVersion
     *  The framework object's framework version.
     */
    constructor(objectFramework: string, objectVersion: string) {
        super();
        this._objectFramework = objectFramework;
        this._objectVersion = objectVersion;
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
    abstract forceSet(id: string | null, text: string | null, frameworkVersion: string): void;

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.
     */
    abstract duplicate(): FrameworkObjectProperty;

}
