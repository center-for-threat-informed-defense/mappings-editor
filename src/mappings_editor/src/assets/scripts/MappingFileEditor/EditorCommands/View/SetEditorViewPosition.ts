import { EditorCommand, EditorDirectives } from "..";
import type { MappingFileEditor } from "../..";

export class SetEditorViewPosition extends EditorCommand {

    /**
     * The file editor.
     */
    public readonly editor: MappingFileEditor;

    /**
     * The view's position.
     */
    public readonly position: number;


    /**
     * Sets a {@link MappingFileEditor}'s view position.
     * @param editor
     *  The editor to operate on.
     * @param position
     *  The view's position (in pixels).
     */
    constructor(editor: MappingFileEditor, position: number) {
        super();
        this.editor = editor;
        this.position = position;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.editor.view.setViewPosition(this.position);
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
