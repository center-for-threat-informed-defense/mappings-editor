import { EditorCommand, EditorDirectives } from "..";
import type { MappingFileView } from "../..";

export class SetMappingFileViewHeight extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    /**
     * The view's height.
     */
    public readonly height: number;


    /**
     * Sets a {@link MappingFileView}'s view height.
     * @param fileView
     *  The mapping file view to operate on.
     * @param height
     *  The view's height (in pixels).
     */
    constructor(fileView: MappingFileView, height: number) {
        super();
        this.fileView = fileView;
        this.height = height;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.fileView.setViewHeight(this.height);
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
