import { EditorCommand, EditorDirective } from "..";
import { MappingObjectView, MappingFileView } from "@/assets/scripts/MappingFileView";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import type { MappingFileViewItem } from "@/assets/scripts/MappingFileView";

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
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.item.collapsed = this.nextValue;
        if(this.item instanceof MappingObjectView) {
            issueDirective(EditorDirective.Record);
        }
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {
        this.item.collapsed = this.prevValue;
    }

}
