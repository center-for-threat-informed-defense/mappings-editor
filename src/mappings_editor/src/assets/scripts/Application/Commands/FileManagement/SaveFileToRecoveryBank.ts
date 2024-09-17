import { toRaw } from "vue";
import { AppCommand } from "..";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";

export class SaveFileToRecoveryBank extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;

    /**
     * The file's editor.
     */
    public readonly editor: MappingFileEditor;


    /**
     * Saves a file to the application's file recovery bank.
     * @param context
     *  The application context.
     * @param editor
     *  The file's editor.
     */
    constructor(context: ApplicationStore, editor: MappingFileEditor) {
        super();
        this.context = context;
        this.editor = toRaw(editor);
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        // Create raw references
        const fileAuthority = toRaw(this.context.fileAuthority);
        const fileSerializer = toRaw(this.context.fileSerializer);
        // Deconstruct file
        const file = fileAuthority.exportMappingFile(
            this.editor.file
        );
        // Serialize file
        const contents = fileSerializer.serialize(file);
        // Store file
        this.context.fileRecoveryBank.saveFile(
            this.editor.id,
            this.editor.name,
            contents
        )
    }

}
