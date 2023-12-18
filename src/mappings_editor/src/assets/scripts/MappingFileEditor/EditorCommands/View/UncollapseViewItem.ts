import { EditorCommand, EditorDirectives } from "..";
import { MappingObjectView, type MappingFileViewItem } from "../..";

export class UncollapseViewItem extends EditorCommand {

    /**
     * The view item to uncollapse.
     */
    public readonly item: MappingFileViewItem;


    /**
     * Uncollapses a {@link MappingFileViewItem}.
     * @param item
     *  The view item to uncollapse.
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
        this.item.collapsed = false;
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
        this.item.collapsed = true;
        return EditorDirectives.RebuildBreakouts;
    }

}
