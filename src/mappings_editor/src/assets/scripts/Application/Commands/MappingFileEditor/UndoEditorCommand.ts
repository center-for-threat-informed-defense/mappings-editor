import { AppCommand } from "../AppCommand";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";

export class UndoEditorCommand extends AppCommand {

    /**
     * The editor to apply the undo operation to.
     */
    private _editor: MappingFileEditor;


    /**
     * Undoes the last editor command.
     * @param editor
     *  The {@link MappingFileEditor}.
     */
    constructor(editor: MappingFileEditor) {
        super();
        this._editor = editor;
    }
    

    /**
     * Executes the command.
     */
    public execute(): void {
        this._editor.undo();
    }

}
