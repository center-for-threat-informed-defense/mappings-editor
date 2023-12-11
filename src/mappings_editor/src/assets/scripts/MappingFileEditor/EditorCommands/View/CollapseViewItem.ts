import { EditorCommand, EditorDirectives } from "..";
import { MappingObjectView, type MappingFileViewItem } from "../..";

export class CollapseViewItem extends EditorCommand {

    /**
     * The view item to collapse.
     */
    public readonly item: MappingFileViewItem;


    /**
     * Collapses a {@link MappingFileViewItem}.
     * @param item
     *  The view item to collapse.
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
        this.item.collapsed = true;
        const record = this.item instanceof MappingObjectView ? 
            EditorDirectives.Record : EditorDirectives.None;
        return record | EditorDirectives.RebuildBreakouts;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        this.item.collapsed = false;
        return EditorDirectives.RebuildBreakouts;
    }

}
