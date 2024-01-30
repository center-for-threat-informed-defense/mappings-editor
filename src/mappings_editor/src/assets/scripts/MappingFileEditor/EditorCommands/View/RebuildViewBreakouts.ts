import { EditorCommand, type MappingFileView } from "../..";

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
     */
    public execute(): void {
        this.fileView.rebuildBreakouts();
    }

    /**
     * Undoes the editor command.
     */
    public undo(): void {
        this.fileView.rebuildBreakouts();
    }

}
