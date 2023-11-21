import { Property } from "./Property";

export class StringProperty extends Property {

    /**
     * The property's value.
     */
    public value: string | null;
    

    /**
     * Creates a new {@link StringProperty}.
     * @param name
     *  The property's name.
     */
    constructor(name: string); 

    /**
     * Creates a new {@link StringProperty}.
     * @param name
     *  The property's name.
     * @param value
     *  The property's value.
     */
    constructor(name: string, value?: string | null);
    constructor(name: string, value?: string | null) {
        super(name);
        this.value = value ?? null;
    }

}
