export abstract class Property {

    /**
     * The property's name.
     */
    public readonly name: string;


    /**
     * Creates a new {@link Property}.
     * @param name
     *  The property's name.
     */
    constructor(name: string) {
        this.name = name;
    }

}
