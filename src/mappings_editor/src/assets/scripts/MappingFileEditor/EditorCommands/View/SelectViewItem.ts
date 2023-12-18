import { EditorCommand, EditorDirectives } from "..";
import type { MappingFileViewItem } from "../..";

export class SelectViewItem extends EditorCommand {

    /**
     * The view item to select.
     */
    public readonly item: MappingFileViewItem;


    /**
     * Selects a {@link MappingFileViewItem}.
     * @param item
     *  The view item to select.
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
        this.item.selected = true;
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
