import { FrameworkListing } from ".";
import { FrameworkObjectProperty } from "./FrameworkObjectProperty";
import type { EditableDynamicFrameworkListing } from "./EditableDynamicFrameworkListing";

export class DynamicFrameworkObjectProperty extends FrameworkObjectProperty {

    /**
     * The object's internal id.
     */
    private _objectId: string | null;

    /**
     * The object's internal text.
     */
    private _objectText: string | null | undefined; 

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
     * The object's id.
     */
    get objectId(): string | null {
        return this._objectId;
    }

    /**
     * The object id's setter.
     */
    set objectId(value: string | null) {
        // If object's value was cached...
        if(this.isObjectValueCached()) {
            // ...switch into listing
            this._objectId = this._framework.switchListingId(value, null);
            this._objectText = undefined;
        }
        // If it wasn't...
        else {
            // ...switch listing
            this._objectId = this._framework.switchListingId(value, this._objectId);
        }
    }

    /**
     * The object's text.
     */
    get objectText(): string | null {
        // If object's value is cached...
        if(this.isObjectValueCached()) {
            // ...return cached text value.
            return this._objectText as string | null;
        }
        // If it isn't...
        else {
            // ...return framework object's text.
            return this._framework.getListingText(this._objectId);
        }   
    }

    /**
     * The object text's setter.
     */
    set objectText(value: string | null) {
        // If object's value is cached...
        if(this.isObjectValueCached()) {
            // ...update cached text
            this._objectText = value;
        }
        // If it isn't...
        else {
            // ...alter existing text
            this._framework.setListingText(this._objectId, value);
        }
    }

    /**
     * True if the object is being targeted, false otherwise.
     */
    public get isTargeted(): boolean {
        // Cached values cannot be targeted
        if(this.isObjectValueCached()) {
            return false;
        }
        return this._objectId === this._framework.targetedObjectId;
    }

    /**
     * The object's target setter.
     */
    public set isTargeted(value: boolean) {
        if(value) {
            // Invalid, null, and singly referenced values cannot be targeted
            const isNull = this.objectId === null;
            const isCached = this.isObjectValueCached();
            const hasMultipleRefs = 1 < this._framework.getReferenceCount(this._objectId);
            if(!isCached && !isNull && hasMultipleRefs) {
                this._framework.targetedObjectId = this.objectId!;
            }
        } else if (!value && this.isTargeted) {
            this._framework.targetedObjectId = undefined;
        }
    }


    /**
     * Creates a new {@link StaticFrameworkObjectProperty}.
     * @param framework
     *  The property's framework listing.
     */
    constructor(framework: EditableDynamicFrameworkListing) {
        super(framework);
        this._objectId = null;
        this._objectText = undefined;
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
        if(this._framework.options.has(id)) {
            if(this._framework.options.get(id) === text) {
                this.objectId = id;
            } else {
                this.cacheObjectValue(id, text);
                wasSet = false;
            }
        } else {
            this.objectId = id;
            this.objectText = text;
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
        const currentId = this.objectId;
        const currentText = this.objectText;
        // Switch out of listing
        this.objectId = null;
        // Cache value
        this._objectId = id !== undefined ? id : currentId;
        this._objectText = text !== undefined ? text : currentText;
        this._objectFramework = framework ?? this._objectFramework;
        this._objectVersion = version ?? this._objectVersion;
    }

    /**
     * Tests if the property's object value is cached.
     * @returns
     *  True if the property's object value is cached, false otherwise.
     */
    public isObjectValueCached(): boolean {
        return this._objectText !== undefined;
    }

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.
     */
    public duplicate(): DynamicFrameworkObjectProperty {
        const duplicate = new DynamicFrameworkObjectProperty(this._framework);
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
