import { NumberProperty, Property, StringProperty } from "..";
import type { ListItem } from "./ListItem";

export class ListProperty extends Property {

    /**
     * The list's item template.
     */
    private _itemTemplate: ListItem

    /**
     * The list's internal items.
     */
    private _value: Map<string, ListItem>


    /**
     * The list's items.
     */
    public get value(): ReadonlyMap<string, ListItem> {
        return this._value;
    }


    /**
     * Creates a new {@link ListProperty}.
     */
    constructor(itemTemplate: ListItem){
        super();
        this._value = new Map();
        this._itemTemplate = itemTemplate;
    }


    /**
     * Creates a new list item.
     * @remarks
     *  This function only creates a list item, it doesn't insert into the
     *  list. Use {@link ListProperty.insertListItem} to insert the item.
     * @returns
     *  The new list item.
     */
    public createNewItem(): ListItem;

    /**
     * Creates a new list item.
     * @remarks
     *  This function only creates a list item, it doesn't insert into the
     *  list. Use {@link ListProperty.insertListItem} to insert the item.
     * @param values
     *  An object containing the item's values.
     * @returns
     *  The new list item.
     */
    public createNewItem(values: { [key: string]: any }): ListItem;
    public createNewItem(values?: { [key: string]: any }): ListItem {
        const item = this._itemTemplate.duplicate();
        if(values) {
            for(const id in values) {
                const prop = item.get(id);
                if(prop instanceof StringProperty) {
                    prop.value = `${ values[id] }`
                } else if(prop instanceof NumberProperty) {
                    prop.value = parseFloat(values[id])
                } else {
                    throw new Error(
                        `Cannot dynamically set property of type: '${
                            prop.constructor.name
                        }'.`
                    )
                }
            }
        }
        return item;
    }

    /**
     * Inserts an item into the list.
     * @param item
     *  The item to insert. 
     */
    public insertListItem(item: ListItem) {
        if(this._value.has(item.id)) {
            throw new Error(`List already contains item '${ item.id }'.`)
        } else {
            this._value.set(item.id, item);
        }
    }

    /**
     * Removes an item from the list.
     * @param id
     *  The id of the item to remove.
     */
    public removeListItem(id: string): void;

    /**
     * Removes an item from the list.
     * @param item
     *  The item to remove.
     */
    public removeListItem(item: ListItem): void;
    public removeListItem(item: string | ListItem) {
        const id = typeof item === "string" ? item : item.id;
        this._value.delete(id);
    }

    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(): ListProperty {
        const property = new ListProperty(this._itemTemplate);
        for(const item of this._value.values()) {
            property.insertListItem(item.duplicate())
        }
        return property;
    }

    /**
     * Returns the property's value as a string.
     * @returns
     *  The property's value as a string.
     */
    public toString(): string {
        return [...this._value.values()].map(o => o.toString()).join(", ");
    }

}
