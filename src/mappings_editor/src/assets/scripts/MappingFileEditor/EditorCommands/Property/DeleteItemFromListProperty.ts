import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
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
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.prop.removeListItem(this.item);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.prop.insertListItem(this.item, this.index);
        issueDirective(EditorDirective.Autosave);
    }

}
