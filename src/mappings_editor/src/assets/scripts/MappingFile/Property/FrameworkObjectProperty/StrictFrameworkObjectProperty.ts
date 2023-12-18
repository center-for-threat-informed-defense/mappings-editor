import { FrameworkObjectProperty } from "./FrameworkObjectProperty";
import type { FrameworkListing } from ".";
import type { EditableStrictFrameworkListing } from "./EditableStrictFrameworkListing";

export class StrictFrameworkObjectProperty extends FrameworkObjectProperty {

    /**
     * The object's internal id.
     */
    private _objectId: string | null;

    /**
     * The object's internal text.
     */
    private _objectText: string | null;

    /**
     * The property's internal framework listing.
     */
    private readonly _framework: EditableStrictFrameworkListing;

    
    /**
     * The property's framework listing.
     */
    public get framework(): FrameworkListing {
        return this._framework;
    }

    /**
     * The object's id.
     */
    get objectId(): string | null {
        return this._objectId;
    }

    /**
     * The object id's setter.
     */
    set objectId(value: string | null) {
        if(this._framework.options.has(value)) {
            this._objectId = value;
            this._objectText = this._framework.options.get(value)!;
        } else {
            throw new Error(`Invalid framework object id '${ value }'.`)
        }
    }

    /**
     * The object's text.
     */
    get objectText(): string | null {
        return this._objectText;
    }

    /**
     * The object text's setter.
     */
    set objectText(_: string | null) {
        throw new Error(
            "Object text cannot be set directly, specify the 'objectId' instead."
        );
    }


    /**
     * Creates a new {@link StrictFrameworkObjectProperty}.
     * @param framework
     *  The property's framework listing.
     */
    constructor(framework: EditableStrictFrameworkListing) {
        super(framework);
        this._objectId = null;
        this._objectText = null;
        this._framework = framework;
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
    public setObjectValue(id: string | null, text: string | null, framework?: string, version?: string): boolean {
        let wasSet = true;
        if(this._framework.options.has(id) && this._framework.options.get(id) === text) {
            this.objectId = id;
        } else {
            this.cacheObjectValue(id, text);
            wasSet = false;
        }
        this._objectFramework = framework ?? this._objectFramework;
        this._objectVersion = version ?? this._objectVersion;
        return wasSet;
    }

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
    public cacheObjectValue(id?: string | null, text?: string | null, framework?: string, version?: string) {
        this._objectId = id !== undefined ? id : this.objectId;
        this._objectText = text !== undefined ? text : this.objectText;
        this._objectFramework = framework ?? this._objectFramework;
        this._objectVersion = version ?? this._objectVersion;
    }

    /**
     * Tests if the property's object value is cached.
     * @returns
     *  True if the property's object value is cached, false otherwise.
     */
    public isObjectValueCached(): boolean {
        return this._framework.options.get(this._objectId) !== this._objectText;
    }

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.s
     */
    public duplicate(): StrictFrameworkObjectProperty {
        const duplicate = new StrictFrameworkObjectProperty(this._framework);
        if(this.isObjectValueCached()) {
            duplicate.cacheObjectValue(
                this.objectId, this.objectText,
                this.objectFramework, this.objectVersion
            )
        } else {
            duplicate.setObjectValue(
                this.objectId, this.objectText,
                this.objectFramework, this.objectVersion
            )
        }
        return duplicate;
    }

}
