import { randomUUID } from "@/assets/scripts/Utilities";
import type { Property } from "..";

export class ListItem {

    /**
     * The list item's id.
     */
    public readonly id: string;

    /**
     * The list item's properties.
     */
    public readonly properties: Map<string, Property>;


    /**
     * Creates a new {@link ListItem}.
     */
    constructor(properties: Map<string, Property>) {
        this.id = randomUUID();
        this.properties = properties;
    }


    /**
     * Returns a property from the item, if it exists.
     * @param key
     *  The property's name.
     * @returns
     *  The property.
     */
    public get(key: string): Property {
        const prop = this.properties.get(key);
        if(!prop) {
            throw new Error(`No property '${ key }'.`)
        } else {
            return prop;
        }
    }

    /**
     * Returns a property from the item as a string.
     * @param key
     *  The property's name.
     * @returns
     *  The property as a string.
     */
    public getAsString(key: string): string {
        const prop = this.properties.get(key);
        if(!prop) {
            throw new Error(`No property '${ key }'.`)
        } else {
            return prop.toString();
        }
    }

    /**
     * Duplicates the list item.
     * @returns
     *  A duplicate of the list item.
     */
    public duplicate(): ListItem { 
        const properties = new Map(
            [...this.properties.entries()].map(([key, value]) => [key, value.duplicate()])
        )
        return new ListItem(properties);
    }

    /**
     * Returns the item as a string.
     * @returns
     *  The item as a string.
     */
    public toString(): string {
        // If the item has just one property...
        if(this.properties.size === 1) {
            // ...return the property as a string.
            return [...this.properties.values()][0].toString()
        }
        // If the item has multiple properties...
        else {
            // ...use JSON notation.
            return JSON.stringify(
                Object.fromEntries(
                    [...this.properties.entries()].map(([key, value]) => [key, value.toString()])
                )
            );
        }
        
    }

    /**
     * Tests if the list item's value is unset.
     * @returns
     *  True if the list item's value is unset, false otherwise.
     */
    public isUnset(): boolean {
        let unset = true;
        for(const prop of this.properties.values()) {
            unset &&= prop.isUnset();
        }
        return unset;
    }

}
