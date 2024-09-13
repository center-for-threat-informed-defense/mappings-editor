import { EditorCommand } from "..";
import type { MappingFileView } from "../..";

export class SetMappingFileViewPosition extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    /**
     * The view's position.
     */
    public readonly position: number;


    /**
     * Sets a {@link MappingFileView}'s view position.
     * @param fileView
     *  The mapping file view to operate on.
     * @param position
     *  The view's position (in pixels).
     */
    constructor(fileView: MappingFileView, position: number) {
        super();
        this.fileView = fileView;
        this.position = position;
    }


    /**
     * Executes the editor command.
     */
    public async execute(): Promise<void> {
        this.fileView.setViewPosition(this.position);
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}
