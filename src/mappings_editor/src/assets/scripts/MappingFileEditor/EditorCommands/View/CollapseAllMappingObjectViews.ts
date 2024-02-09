import { EditorCommand } from "..";
import { MappingObjectView, MappingFileView } from "../..";

export class CollapseAllMappingObjectViews extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    /**
     * The collapse state.
     */
    public readonly value: boolean;


    /**
     * Uncollapses / Collapses all {@link MappingObjectView}.
     * @param fileView
     *  The mapping file view to operate on.
     * @param value
     *  True to collapse the items, false to uncollapse the items.
     */
    constructor(fileView: MappingFileView, value: boolean) {
        super();
        this.fileView = fileView;
        this.value = value;
    }


    /**
     * Executes the editor command.
     */
    public execute(): void {
        this.fileView.setAllItemsCollapse(this.value, o => o instanceof MappingObjectView);
    }

    /**
     * Undoes the editor command.
     */
    public undo(): void {}

}
