import { EditorCommand, EditorDirectives } from "..";
import type { ListItem, ListProperty } from "@/assets/scripts/MappingFile";

export class AddItemToListProperty extends EditorCommand {

    /**
     * The index to insert the item at.
     */
    public readonly index: number | undefined;

    /**
     * The list item to add.
     */
    public readonly item: ListItem;

    /**
     * The property.
     */
    public readonly prop: ListProperty;
    

    /**
     * Adds a {@link ListItem} to a {@link ListProperty}.
     * @param prop
     *  The {@link ListProperty}.
     * @param value
     *  The {@link ListItem} to add.
     * @param index
     *  The index to insert the item at.
     */
    constructor(prop: ListProperty, item: ListItem, index?: number){
        super();
        this.prop = prop;
        this.item = item;
        this.index = index;
    }
    

    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    execute(): EditorDirectives {
        this.prop.insertListItem(this.item, this.index);
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    undo(): EditorDirectives {
        this.prop.removeListItem(this.item);
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

}
