import type { FrameworkListing } from ".";
import { Property } from "../Property";

export abstract class FrameworkObjectProperty extends Property {

    /**
     * The object's internal framework.
     */
    protected _objectFramework: string;

    /**
     * The object's internal framework version.
     */
    protected _objectVersion: string;


    /**
     * The object's framework.
     */
    get objectFramework(): string {
        return this._objectFramework;
    }

    /**
     * The object's framework version.
     */
    get objectVersion(): string {
        return this._objectVersion;
    }

    /**
     * The object's id.
     */
    abstract get objectId(): string | null;

    /**
     * The object's id setter.
     */
    abstract set objectId(value: string | null);

    /**
     * The object's text.
     */
    abstract get objectText(): string | null;

    /**
     * The object's text setter.
     */
    abstract set objectText(value: string | null);

    /**
     * The property's framework listing.
     */
    abstract get framework(): FrameworkListing;


    /**
     * Creates a new {@link FrameworkObjectProperty}.
     * @param framework
     *  The property's framework listing.
     */
    constructor(framework: FrameworkListing) {
        super();
        this._objectFramework = framework.id;
        this._objectVersion = framework.version;
    }


    /**
     * Sets the property's object value. If the specified object value is
     * invalid, the value is cached instead. 
     * @param id 
     *  The framework object's id.
     * @param text 
     *  The framework object's text.
     * @param framework
     *  The framework object's framework.
     * @param version
     *  The framework object's framework version.
     * @returns
     *  True if the object value was set successfully, false if it was cached.
     */
    abstract setObjectValue(id: string | null, text: string | null, framework?: string, version?: string): boolean;

    /**
     * Caches the provided object value and, if necessary, removes the object's
     * current value from the underlying framework listing. If no value is
     * provided, the object's current value is cached instead.
     * 
     * This function allows a property to be set with an invalid object value
     * (one not included in the framework listing). It also allows a valid
     * object value to be temporarily withheld from the framework listing. 
     * 
     * The latter can be useful when deleting a FrameworkObjectProperty from a
     * document. While the property is deleted, its value might not need to
     * appear in the underlying framework listing. However, we still want to
     * store its original value so we have the option of restoring it later.
     * @param id 
     *  The object's id.
     * @param text
     *  The object's text.
     * @param framework
     *  The object's framework.
     * @param version
     *  The object's framework version.
     */
    abstract cacheObjectValue(id?: string | null, text?: string | null, framework?: string, version?: string): void;

    /**
     * Attempts to uncache the property's current object value.
     * @returns
     *  True if the object value was successfully uncached, false otherwise.
     */
    public tryUncacheObjectValue(): boolean {
        return this.setObjectValue(this.objectId, this.objectText);   
    }

    /**
     * Tests if the property's object value is cached.
     * @returns
     *  True if the property's object value is cached, false otherwise.
     */
    abstract isObjectValueCached(): boolean;

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.
     */
    abstract duplicate(): FrameworkObjectProperty;

    /**
     * Returns the property's value as a string.
     * @returns
     *  The property's value as a string.
     */
    public toString(): string {
        return `${ this.objectId }: ${ this.objectText }`
    }

}
