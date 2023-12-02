export abstract class Property {

    /**
     * Creates a new {@link Property}.
     */
    constructor() {}


    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    abstract duplicate(): Property;

    /**
     * Returns the property's value as a string.
     * @returns
     *  The property's value as a string.
     */
    abstract toString(): string;

}
