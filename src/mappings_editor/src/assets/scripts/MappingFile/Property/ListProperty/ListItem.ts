import { randomUUID } from "@/assets/scripts/Utilities";
import type { Property } from "..";

export class ListItem {

    /**
     * The list item's id.
     */
    public readonly id: string;

    /**
     * The list item's internal properties.
     */
    private readonly _properties: Map<string, Property>;


    /**
     * The list item's properties.
     */
    public get properties(): ReadonlyMap<string, Property> {
        return this._properties;
    }


    /**
     * Creates a new {@link ListItem}.
     */
    constructor(properties: Map<string, Property>) {
        this.id = randomUUID();
        this._properties = properties;
    }

    public getAsString(key: string): string {
        const prop = this.properties.get(key);
        if(!prop) {
            throw new Error(`No property'${ key }'.`)
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
            [...this._properties.entries()].map(([key, value]) => [key, value.duplicate()])
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
        if(this._properties.size === 1) {
            // ...return the property as a string.
            return [...this._properties.values()][0].toString()
        }
        // If the item has multiple properties...
        else {
            // ...use JSON notation.
            return JSON.stringify(
                Object.fromEntries(
                    [...this._properties.entries()].map(([key, value]) => [key, value.toString()])
                )
            );
        }
        
    }

}
