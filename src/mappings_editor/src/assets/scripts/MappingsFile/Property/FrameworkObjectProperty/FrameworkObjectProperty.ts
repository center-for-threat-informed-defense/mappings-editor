import { Property } from "../Property";

export abstract class FrameworkObjectProperty extends Property {

    /**
     * The framework object's id.
     */
    abstract get objectId(): string | null;

    /**
     * The framework object id's setter.
     */
    abstract set objectId(value: string | null);

    /**
     * The framework object's text.
     */
    abstract get objectText(): string | null;

    /**
     * The framework object text's setter.
     */
    abstract set objectText(value: string | null);


    /**
     * Creates a new {@link FrameworkObjectProperty}.
     * @param name
     *  The property's name.
     */
    constructor(name: string) {
        super(name);
    }


    /**
     * Forcibly sets the framework object's id.
     * @param id 
     *  The framework object's id.
     */
    abstract forceSetObjectId(id: string | null): void;

    /**
     * Forcibly sets the framework object's text.
     * @param text
     *  The framework object's text.
     */
    abstract forceSetObjectText(text: string | null): void;

    /**
     * Duplicates the object property.
     * @returns
     *  The duplicated object property.
     */
    abstract duplicate(): FrameworkObjectProperty;

}
