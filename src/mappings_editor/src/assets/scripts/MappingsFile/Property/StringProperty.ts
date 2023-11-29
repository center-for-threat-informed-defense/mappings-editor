import { Property } from "./Property";

export class StringProperty extends Property {

    /**
     * The property's value.
     */
    public value: string | null;
    

    /**
     * Creates a new {@link StringProperty}.
     */
    constructor(); 

    /**
     * Creates a new {@link StringProperty}.
     * @param value
     *  The property's value.
     */
    constructor(value?: string | null);
    constructor(value?: string | null) {
        super();
        this.value = value ?? null;
    }

}
