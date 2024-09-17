import { FrameworkObjectProperty } from "./FrameworkObjectProperty";
import type { FrameworkListing } from ".";
import type { EditableStrictFrameworkListing } from "./EditableStrictFrameworkListing";

/**
 * A {@link StrictFrameworkObjectProperty} is a special property type that
 * represents a single "framework object". Each framework object is uniquely
 * identified by an `id` and is described with `text`. A valid `id` / `text`
 * pair comes from a STRICT list of options ({@link FrameworkListing}) that
 * should not change once the listing has been provided to the property.
 */
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
     * Returns true if the object property is cached, false otherwise.
     */
    private _objectCached: boolean;

    /**
     * The property's internal (editable) framework listing.
     */
    private readonly _framework: EditableStrictFrameworkListing;


    /**
     * The property's (read-only) framework listing.
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
            // Pivot reference
            if(this._objectCached) {
                this._objectCached = false;
                this._framework.pivotReference(value, null);
            } else {
                this._framework.pivotReference(value, this.objectId);
            }
            // Update value
            this._objectId = value;
            this._objectText = this._framework.options.get(value)!;
            // If the previous value originated from an unknown version of the
            // listing's framework, auto-migrate to the current version.
            if(
                this._objectFramework === this.framework.id &&
                this._objectVersion === FrameworkObjectProperty.UNKNOWN_FRAMEWORK_VERSION
            ) {
                this._objectVersion = this.framework.version;
            }
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
     * @param name
     *  The property's human-readable name.
     * @param framework
     *  The property's framework listing.
     */
    constructor(name: string, framework: EditableStrictFrameworkListing) {
        super(name, framework);
        this._objectId = null;
        this._objectText = null;
        this._objectCached = true;
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
        // Configure framework
        this._objectFramework = framework ?? this._objectFramework;
        this._objectVersion = version ?? this._objectVersion;
        // Configure value
        if(this._framework.has(id, text)) {
            this.objectId = id;
        } else {
            this.cacheObjectValue(id, text);
            // If the value had to be cached, the property cannot be of the
            // same framework and version as its `FrameworkListing`. In this
            // case, it's assumed that the value comes from an unknown
            // version of the framework.
            if(
                this._objectFramework === this.framework.id &&
                this._objectVersion === this.framework.version
            ) {
                this._objectVersion = FrameworkObjectProperty.UNKNOWN_FRAMEWORK_VERSION;
            }
            wasSet = false;
        }
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
        this._objectCached = true;
        // Pivot off of listing
        this._framework.pivotReference(null, this.objectId);
        // Cache value
        this._objectId = id !== undefined ? id : this._objectId;
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
        return this._objectCached;
    }

    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(): StrictFrameworkObjectProperty;

    /**
     * Duplicates the property.
     * @param name
     *  The property's human-readable name.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(name?: string): StrictFrameworkObjectProperty {
        const duplicate = new StrictFrameworkObjectProperty(name ?? this.name, this._framework);
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
