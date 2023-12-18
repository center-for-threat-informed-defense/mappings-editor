import { EditorCommand, EditorDirectives } from "..";
import type { MappingFileEditor } from "../..";

export class SetEditorViewHeight extends EditorCommand {

    /**
     * The file editor.
     */
    public readonly editor: MappingFileEditor;

    /**
     * The view's height.
     */
    public readonly height: number;


    /**
     * Sets a {@link MappingFileEditor}'s view height.
     * @param editor
     *  The editor to operate on.
     * @param height
     *  The view's height (in pixels).
     */
    constructor(editor: MappingFileEditor, height: number) {
        super();
        this.editor = editor;
        this.height = height;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.editor.view.setViewHeight(this.height);
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
