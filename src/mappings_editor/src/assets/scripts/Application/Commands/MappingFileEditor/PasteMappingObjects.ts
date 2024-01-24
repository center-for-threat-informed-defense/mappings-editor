import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands"
import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { MappingFileAuthority } from "@/assets/scripts/MappingFileAuthority";
import type { MappingFileSerializer } from "../..";

export class PasteMappingObjects extends AppCommand {

    /**
     * The mapping file authority.
     */
    public readonly fileAuthority: MappingFileAuthority;

    /**
     * The mapping file serializer.
     */
    public readonly fileSerializer: MappingFileSerializer;

    /**
     * The mapping file editor.
     */
    public readonly editor: MappingFileEditor;


    /**
     * Pastes the clipboard's contents into a {@link MappingFile}.
     * @param context
     *  The application context.
     * @param file
     *  The mapping file editor to operate on.
     */
    constructor(context: ApplicationStore, editor: MappingFileEditor) {
        super();
        this.fileAuthority = context.fileAuthority as MappingFileAuthority;
        this.fileSerializer = context.fileSerializer;
        this.editor = editor;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        navigator.clipboard.readText().then((text: string) => {
            const fileView = this.editor.view;
            // Deserialize items
            const file = this.fileAuthority.exportMappingFile(this.editor.file, false);
            const exports = this.fileSerializer.processPaste(text, file);
            // Configure insert
            const ids: string[] = [];
            const insert = EditorCommands.createGroupCommand();
            for(let i = exports.length - 1; 0 <= i; i--){
                // Create object
                const obj = this.fileAuthority.initializeMappingObjectExport(exports[i], this.editor.file);
                // Store object id
                ids.push(obj.id);
                // Insert object
                insert.do(EditorCommands.insertMappingObject(this.editor.file, obj));   
            }
            // Configure view command
            const cmd = EditorCommands.createSplitPhaseViewCommand(
                insert,
                () => [
                    EditorCommands.rebuildViewBreakouts(fileView),
                    EditorCommands.unselectAllMappingObjectViews(fileView),
                    EditorCommands.selectMappingObjectViewsById(fileView, ids),
                ]
            )
            // Execute insert
            this.editor.execute(cmd);
        }).catch(reason => {
            console.error("Failed to read clipboard: ", reason);
        })
    }

}
