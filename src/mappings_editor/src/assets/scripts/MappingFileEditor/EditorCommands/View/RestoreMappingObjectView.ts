import { EditorCommand, EditorDirectives } from "..";
import type { MappingObjectView } from "../..";

export class RestoreMappingObjectView extends EditorCommand {

    /**
     * The mapping object view to restore.
     */
    public readonly view: MappingObjectView;


    /**
     * Restores a {@link MappingObjectView} to its {@link MappingFileView}.
     * @param view
     *  The {@link MappingObjectView}.
     */
    constructor(view: MappingObjectView) {
        super();
        this.view = view;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        return EditorDirectives.None;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        this.view.fileView.restoreMappingObjectView(this.view);
        return EditorDirectives.RebuildBreakouts;
    }

}
