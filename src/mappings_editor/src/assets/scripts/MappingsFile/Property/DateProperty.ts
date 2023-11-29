import { Property } from "./Property";

export class DateProperty extends Property {

    /**
     * The property's value.
     */
    public value: Date | null;
    

    /**
     * Creates a new {@link DateProperty}.
     */
    constructor(); 

    /**
     * Creates a new {@link DateProperty}.
     * @param value
     *  The property's value.
     */
    constructor(value?: Date | null);
    constructor(value?: Date | null) {
        super();
        this.value = value ?? null;
    }

}
