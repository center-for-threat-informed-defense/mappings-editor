import { EditorCommand, EditorDirectives } from "..";
import type { ListItem, ListProperty } from "@/assets/scripts/MappingFile";

export class DeleteItemFromListProperty extends EditorCommand {

    /**
     * The index the item was located at.
     */
    public readonly index: number | undefined;

    /**
     * The list item to delete.
     */
    public readonly item: ListItem;

    /**
     * The property.
     */
    public readonly prop: ListProperty;
    

    /**
     * Deletes a {@link ListItem} from a {@link ListProperty}.
     * @param prop
     *  The {@link ListProperty}.
     * @param value
     *  The {@link ListItem} to delete.
     */
    constructor(prop: ListProperty, item: ListItem){
        super();
        this.prop = prop;
        this.item = item;
        this.index = prop.getListItemIndex(item);
        if(this.index === -1) {
            throw new Error(`List does not contain item '${ item.id }'.`)
        }
    }
    

    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    execute(): EditorDirectives {
        this.prop.removeListItem(this.item);
        return EditorDirectives.Record;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    undo(): EditorDirectives {
        this.prop.insertListItem(this.item, this.index);
        return EditorDirectives.None;
    }

}
