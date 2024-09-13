import { AppCommand } from "../AppCommand";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";

export class RedoEditorCommand extends AppCommand {

    /**
     * The editor to apply the redo operation to.
     */
    private _editor: MappingFileEditor;


    /**
     * Redoes the last undone editor command.
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
    public async execute(): Promise<void> {
        await this._editor.redo();
    }

}
