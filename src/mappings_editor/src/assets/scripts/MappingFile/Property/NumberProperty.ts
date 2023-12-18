import { Property } from "./Property";

export class NumberProperty extends Property {

    /**
     * The property's internal value.
     */
    private _value: number | null;
    

    /**
     * The property's value.
     */
    public get value(): number | null {
        return this._value;
    }

    /**
     * The property's value setter.
     */
    public set value(value: number | null) {
        if(value === null) {
            this._value = null;
        } else {
            this._value = value;
        }
    }


    /**
     * Creates a new {@link NumberProperty}.
     */
    constructor();

    /**
     * Creates a new {@link NumberProperty}.
     * @param value
     *  The property's initial value.
     */
    constructor(value: number | null);
    constructor(value?: number | null) {
        super();
        this._value = null;
        this.value = value ?? null;
    }


    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(): NumberProperty {
        const property = new NumberProperty();
        property.value = this.value;
        return property;
    }

    /**
     * Returns the property's value as a string.
     * @returns
     *  The property's value as a string.
     */
    public toString(): string {
        return `${ this.value }` ?? "";
    }

}
