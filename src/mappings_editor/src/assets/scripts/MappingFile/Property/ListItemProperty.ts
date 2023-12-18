import { Property } from ".";
import { randomUUID } from "../../Utilities";
import type { ListProperty } from "./ListProperty";

export class ListItemProperty extends Property {

    /**
     * The property's options.
     */
    public readonly options: ListProperty;

    /**
     * The property's internal value.
     */
    private _value: string | null;

    /**
     * The property's cached export value.
     */
    private _cachedExportValue: string | null;

    /**
     * The property's cached export text.
     */
    private _cachedExportText: string | null;

    /**
     * The property's export value key.
     */
    public readonly exportValueKey: string;

    /**
     * The property's export text key.
     */
    public readonly exportTextKey: string;


    /**
     * The property's value.
     */
    public get value(): string | null {
        return this._value;
    }

    /**
     * The property's value setter.
     */
    public set value(id: string | null) {
        if(id === null) {
            this._value = null;
            return;
        }
        const value = this.options.value.get(id);
        if(!value) {
            throw new Error(`List does not contain item '${id}'.`)
        }
        this._value = value.id;
        this._cachedExportValue = this.exportValue;
        this._cachedExportText = this.exportText;
    }

    /**
     * The property's export value.
     */
    public get exportValue(): string | null {
        if(this._value === null) {
            return null;
        }
        if(this.isValueCached()) {
            return this._cachedExportValue;
        }
        const item = this.options.value.get(this._value)!;
        const property = item.get(this.exportValueKey);
        return property.toString();
    }

    /**
     * The property's export text.
     */
    public get exportText(): string | null {
        if(this._value === null) {
            return null;
        }
        if(this.isValueCached()) {
            return this._cachedExportText;
        }
        const item = this.options.value.get(this._value)!;
        const property = item.get(this.exportTextKey);
        return property.toString();
    }


    /**
     * Creates a new {@link ListItemProperty}.
     * @param name
     *  The property's human-readable name.
     * @param exportValueKey
     *  The property (on each list item) that acts as the export value.
     * @param exportTextKey
     *  The property (on each list item) that acts as the export text.
     * @param options
     *  The {@link ListProperty} that lists the valid options.
     */
    constructor(name: string, exportValueKey: string, exportTextKey: string, options: ListProperty) {
        super(name);
        this._value = null;
        this._cachedExportValue = null;
        this._cachedExportText = null;
        this.exportValueKey = exportValueKey;
        this.exportTextKey = exportTextKey;
        this.options = options;
    }


    /**
     * Caches the provided list item's value. This function allows the property
     * to be set with an invalid value (one not included in the list property).
     * @param exportValue
     *  The export value.
     * @param exportText
     *  The export text.
     */
    public cacheValue(exportValue: string | null, exportText: string | null): void; 
    public cacheValue(exportValue: string | null, exportText: string | null) {
        this._value = randomUUID();
        this._cachedExportValue = exportValue;
        this._cachedExportText = exportText;
    }

    /**
     * Tests if the property's value is cached.
     * @returns
     *  True if the property's value is cached, false otherwise.
     */
    public isValueCached(): boolean {
        return this._value !== null && !this.options.value.has(this._value)
    }

    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(): ListItemProperty;

    /**
     * Duplicates the property.
     * @param name
     *  The property's human-readable name.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(name?: string): ListItemProperty {
        const property = new ListItemProperty(
            name ?? this.name, this.exportValueKey, 
            this.exportTextKey, this.options
        );   
        if(this.isValueCached()) {
            property.cacheValue(this.exportValue, this.exportText);
        } else {
            property.value = this.value;
        }
        return property;
    }

    /**
     * Returns the property's value as a string.
     * @returns
     *  The property's value as a string.
     */
    public toString(): string {
        return this.exportText ?? "";
    }

    /**
     * Tests if the property's value is unset.
     * @returns
     *  True if the property's value is unset, false otherwise.
     */
    public isUnset(): boolean {
        return this._value === null;
    }

}
