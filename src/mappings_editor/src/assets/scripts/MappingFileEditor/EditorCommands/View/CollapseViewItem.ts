import { EditorCommand, EditorDirectives } from "..";
import { MappingObjectView, type MappingFileViewItem, MappingFileView } from "../..";

export class CollapseViewItem extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;
    
    /**
     * The view item to collapse.
     */
    public readonly item: MappingFileViewItem;

    /**
     * The next collapsed state.
     */
    public readonly nextValue: boolean;

    /**
     * The previous collapsed state.
     */
    public readonly prevValue: boolean;


    /**
     * Uncollapses / Collapses a {@link MappingFileViewItem}.
     * @param item
     *  The view item to collapse.
     * @param value
     *  True to collapse the item, false to uncollapse the item.
     */
    constructor(item: MappingFileViewItem, value: boolean) {
        super();
        this.fileView = item.fileView;
        this.item = item;
        this.prevValue = item.collapsed;
        this.nextValue = value;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.item.collapsed = this.nextValue;
        if(this.item instanceof MappingObjectView) {
            return EditorDirectives.Record;
        } else {
            return EditorDirectives.None;
        }
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        this.item.collapsed = this.prevValue;
        return EditorDirectives.None;
    }

}
