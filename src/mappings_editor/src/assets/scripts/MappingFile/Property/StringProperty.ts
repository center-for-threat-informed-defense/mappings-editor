import { Property } from "./Property";

export class StringProperty extends Property {

    /**
     * The property's internal value.
     */
    private _value: string | null;
    

    /**
     * The property's value.
     */
    public get value(): string | null {
        return this._value;
    }

    /**
     * The property's value setter.
     */
    public set value(value: string | null | undefined) {
        if(value === undefined) {
            return;
        } else if(value === "" || value === null) {
            this._value = null;
        } else {
            this._value = value;
        }
    }


    /**
     * Creates a new {@link StringProperty}.
     * @param name
     *  The property's human-readable name.
     */
    constructor(name: string);

    /**
     * Creates a new {@link StringProperty}.
     * @param name
     *  The property's human-readable name.
     * @param value
     *  The property's initial value.
     */
    constructor(name: string, value: string | null);
    constructor(name: string, value?: string | null) {
        super(name);
        this._value = null;
        this.value = value ?? null;
    }


    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(): StringProperty

    /**
     * Duplicates the property.
     * @param name
     *  The property's human-readable name.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(name?: string): StringProperty {
        const property = new StringProperty(name ?? this.name);
        property.value = this.value;
        return property;
    }

    /**
     * Returns the property's value as a string.
     * @returns
     *  The property's value as a string.
     */
    public toString(): string {
        return this.value ?? "";
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
