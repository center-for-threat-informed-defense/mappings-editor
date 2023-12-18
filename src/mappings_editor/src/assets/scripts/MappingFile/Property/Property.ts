export abstract class Property {

    /**
     * The property's human-readable name.
     */
    public readonly name: string;


    /**
     * Creates a new {@link Property}.
     * @param name
     *  The property's human-readable name.
     */
    constructor(name: string) {
        this.name = name;
    }


    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    abstract duplicate(): Property;

    /**
     * Duplicates the property.
     * @param name
     *  The property's human-readable name.
     * @returns
     *  A duplicate of the property.
     */
    abstract duplicate(name?: string): Property;

    /**
     * Returns the property's value as a string.
     * @returns
     *  The property's value as a string.
     */
    abstract toString(): string;

    /**
     * Tests if the property's value is unset.
     * @returns
     *  True if the property's value is unset, false otherwise.
     */
    abstract isUnset(): boolean;

}
