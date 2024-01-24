import { EditorCommand, EditorDirectives } from "..";
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
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.fileView.setViewPosition(this.position);
        return EditorDirectives.None;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        return EditorDirectives.None;
    }

}
