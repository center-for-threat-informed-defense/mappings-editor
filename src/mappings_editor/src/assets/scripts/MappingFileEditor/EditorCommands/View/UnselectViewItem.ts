import { EditorCommand, EditorDirectives } from "..";
import type { MappingFileViewItem } from "../..";

export class UnselectViewItem extends EditorCommand {

    /**
     * The view item to unselect.
     */
    public readonly item: MappingFileViewItem;


    /**
     * Unselects a {@link MappingFileViewItem}.
     * @param item
     *  The view item to unselect.
     */
    constructor(item: MappingFileViewItem) {
        super();
        this.item = item;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.item.selected = false;
        return EditorDirectives.None;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        return EditorDirectives.None;
    }

}
