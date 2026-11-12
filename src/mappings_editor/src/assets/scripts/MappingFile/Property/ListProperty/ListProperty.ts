import { ListItemProperty, NumberProperty, Property, StringProperty } from "..";
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
     * @param name
     *  The property's human-readable name.
     */
    constructor(name: string, itemTemplate: ListItem){
        super(name);
        this._value = new Map();
        this._itemTemplate = itemTemplate;
    }

    /**
     * Creates a new list item.
     * @remarks
     *  This function only creates a list item, it doesn't insert into the
     *  list. Use {@link ListProperty.insertListItem} to insert the item.
     * @param values
     *  Plain values keyed by the template's property names, such as
     *  { attack_object_id: "M1036", most_relevant: true }.
     * @returns
     *  The new list item.
     */
    public createNewItem(values?: { [key: string]: any }): ListItem {
        // Copy the template's property objects into a new row with its own UUID.
        // Dropdown properties keep the same options list when duplicated.
        const item = this._itemTemplate.duplicate();
        if(values) {
            for(const id in values) {
                // Here, 'id' is a field name, not the row's UUID. get() returns
                // its Property object and throws if the template has no such field.
                const prop = item.get(id);
                if(prop instanceof StringProperty) {
                    // StringProperty stores text directly; its setter treats "" as unset.
                    prop.value = `${ values[id] }`
                } else if(prop instanceof ListItemProperty) {
                    // A dropdown's value is an internal option UUID. exportValue
                    // selects by the supplied data value instead (e.g. "true").
                    // Null/undefined clears it; unmatched values are cached so
                    // the editor can retain and flag unrecognized selections.
                    prop.exportValue = values[id] == null ? null : String(values[id]);
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
     * @param index
     *  The index to insert the item at.
     */
    public insertListItem(item: ListItem, index?: number) {
        if(this._value.has(item.id)) {
            throw new Error(`List already contains item '${ item.id }'.`)
        } else if(index === undefined) {
            this._value.set(item.id, item);
        } else {
            const entries = [...this.value];
            entries.splice(index, 0, [item.id, item]);
            this._value = new Map(entries);
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
     * Returns the id of the first item in the list where the predicate is
     * true, and undefined otherwise.
     * @param predicate
     *  The predicate to execute on each list item.
     * @returns
     *  The item's id, `undefined` if no item matched the predicate.
     */
    public findListItemId(predicate: (value: ListItem) => boolean): string | undefined {
        for(const [key, value] of this.value) {
            if(predicate(value)) {
                return key;
            }
        }
        return undefined;
    }

    /**
     * Returns the index of a list item.
     * @param id
     *  The id of the item.
     * @returns
     *  The index of the list item.
     */
    public getListItemIndex(id: string): number;

    /**
     * Returns the index of a list item.
     * @param item
     *  The item.
     * @returns
     *  The index of the list item.
     */
    public getListItemIndex(item: ListItem): number;
    public getListItemIndex(item: string | ListItem): number {
        const id = typeof item === "string" ? item : item.id;
        return [...this._value.keys()].findIndex(k => k === id);
    }

    /**
     * Duplicates the property.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(): ListProperty;

    /**
     * Duplicates the property.
     * @param name
     *  The property's human-readable name.
     * @returns
     *  A duplicate of the property.
     */
    public duplicate(name?: string): ListProperty {
        const property = new ListProperty(name ?? this.name, this._itemTemplate);
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

    /**
     * Tests if the property's value is unset.
     * @returns
     *  True if the property's value is unset, false otherwise.
     */
    public isUnset(): boolean {
        return this._value.size === 0;
    }

}
