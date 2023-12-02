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
    private _cachedExportValue: string;

    /**
     * The property's cached export text.
     */
    private _cachedExportText: string;

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
        const idProperty = value.properties.get(this.exportValueKey);
        if(!idProperty) {
            throw new Error(`List item has no property '${ this.exportValueKey }'.`);
        }
        const textProperty = value.properties.get(this.exportTextKey);
        if(!textProperty) {
            throw new Error(`List item has no property '${ this.exportTextKey }'.`);
        }
        this._value = value.id;
        this._cachedExportValue = idProperty.toString();
        this._cachedExportText = textProperty.toString();
    }

    /**
     * The property's export value.
     */
    public get exportValue(): string | null {
        if(this._value === null) {
            return null;
        }
        const item = this.options.value.get(this._value);
        if(!item) {
            return this._cachedExportValue;
        }
        const property = item.properties.get(this.exportValueKey);
        if(!property) {
            throw new Error(`List item has no property '${ this.exportValueKey }'.`);
        }
        return property.toString();
    }

    /**
     * The property's export text.
     */
    public get exportText(): string | null {
        if(this._value === null) {
            return null;
        }
        const item = this.options.value.get(this._value);
        if(!item) {
            return this._cachedExportText;
        }
        const property = item.properties.get(this.exportTextKey);
        if(!property) {
            throw new Error(`List item has no property '${ this.exportTextKey }'.`);
        }
        return property.toString();
    }


    /**
     * Creates a new {@link ListItemProperty}.
     * @param exportValueKey
     *  The property (on each list item) that acts as the export value.
     * @param exportTextKey
     *  The property (on each list item) that acts as the export text.
     * @param options
     *  The {@link ListProperty} that lists the valid options.
     */
    constructor(exportValueKey: string, exportTextKey: string, options: ListProperty) {
        super();
        this._value = null;
        this._cachedExportValue = "???";
        this._cachedExportText = "???";
        this.exportValueKey = exportValueKey;
        this.exportTextKey = exportTextKey;
        this.options = options;
    }


    /**
     * Forcibly sets the list item's value.
     * @param exportValue
     *  The export value.
     * @param exportText
     *  The export text.
     */
    public forceSetValue(exportValue: string, exportText: string): void;

    /**
     * Forcibly sets the list item's value.
     * @param exportValue
     *  The export value.
     * @param exportText
     *  The export text.
     * @param value
     *  The value.
     */
    public forceSetValue(exportValue: string, exportText: string, value: string | null): void; 
    public forceSetValue(exportValue: string, exportText: string, value?: string | null) {
        this._value = value ?? randomUUID();
        this._cachedExportValue = exportValue;
        this._cachedExportText = exportText;
    }

    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(): ListItemProperty {
        const property = new ListItemProperty(this.exportValueKey, this.exportTextKey, this.options);   
        property.forceSetValue(this._cachedExportValue, this._cachedExportText, this._value);
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

}
