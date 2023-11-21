import { Property } from "./Property";

export class DateProperty extends Property {

    /**
     * The property's value.
     */
    public value: Date | null;
    

    /**
     * Creates a new {@link DateProperty}.
     * @param name
     *  The property's name.
     */
    constructor(name: string); 

    /**
     * Creates a new {@link DateProperty}.
     * @param name
     *  The property's name.
     * @param value
     *  The property's value.
     */
    constructor(name: string, value?: Date | null);
    constructor(name: string, value?: Date | null) {
        super(name);
        this.value = value ?? null;
    }

}
