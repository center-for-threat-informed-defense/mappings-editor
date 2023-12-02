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
    public set value(value: string | null) {
        if(value === "" || value === null) {
            this._value = null;
        } else {
            this._value = value;
        }
    }


    /**
     * Creates a new {@link StringProperty}.
     */
    constructor();

    /**
     * Creates a new {@link StringProperty}.
     * @param value
     *  The property's initial value.
     */
    constructor(value: string | null);
    constructor(value?: string | null) {
        super();
        this._value = null;
        this.value = value ?? null;
    }


    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(): StringProperty {
        const property = new StringProperty();
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

}
