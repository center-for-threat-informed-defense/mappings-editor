import { EditorCommand, EditorDirectives, type MappingFileView } from "../..";

export class RebuildViewBreakouts extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    
    /**
     * Rebuilds a {@link MappingFileView}'s breakouts.
     * @param fileView
     *  The mapping file view to operate on.
     */
    constructor(fileView: MappingFileView) {
        super();
        this.fileView = fileView;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.fileView.rebuildBreakouts();
        return EditorDirectives.None;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        this.fileView.rebuildBreakouts();
        return EditorDirectives.None;
    }

}
