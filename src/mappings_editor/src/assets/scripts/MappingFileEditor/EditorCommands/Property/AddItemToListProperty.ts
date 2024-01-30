import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
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
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    execute(issueDirective: DirectiveIssuer): void {
        this.prop.insertListItem(this.item, this.index);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    undo(issueDirective: DirectiveIssuer): void {
        this.prop.removeListItem(this.item);
        issueDirective(EditorDirective.Autosave);
    }

}
