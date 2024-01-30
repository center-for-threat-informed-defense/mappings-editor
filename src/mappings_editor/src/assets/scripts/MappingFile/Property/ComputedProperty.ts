import { Property } from "./Property";

export class ComputedProperty<T> extends Property {

    /**
     * The property's internal value.
     */
    private _value: () => T;

    /**
     * The property's value.
     */
    public get value(): T {
        return this._value();
    }


    /**
     * Creates a new {@link StringProperty}.
     * @param name
     *  The property's human-readable name.
     * @param value
     *  A function that computes the property's value.
     */
    constructor(name: string, value: () => T) {
        super(name);
        this._value = value;
    }


    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(): ComputedProperty<T>;

    /**
     * Duplicates the property.
     * @param name
     *  The property's human-readable name.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(name?: string): ComputedProperty<T> {
        return new ComputedProperty(name ?? this.name, this._value);
    }

    /**
     * Returns the property's value as a string.
     * @returns
     *  The property's value as a string.
     */
    public toString(): string {
        return `${ this.value }`;
    }

    /**
     * Tests if the property's value is unset.
     * @returns
     *  True if the property's value is unset, false otherwise.
     */
    public isUnset(): boolean {
        throw new Error("Computed properties cannot be set / unset.")
    }

}
