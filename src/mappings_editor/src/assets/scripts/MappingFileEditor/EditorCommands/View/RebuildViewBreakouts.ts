import { EditorCommand } from "../EditorCommand";
import type { MappingFileView } from "@/assets/scripts/MappingFileView";

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
    public async execute(): Promise<void> {
        this.fileView.rebuildBreakouts();
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {
        this.fileView.rebuildBreakouts();
    }

}
