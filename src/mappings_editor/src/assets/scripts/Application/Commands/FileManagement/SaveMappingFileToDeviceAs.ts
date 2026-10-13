import { Browser } from "@/assets/scripts/Utilities/Browser";
import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import { RemoveFileFromRecoveryBank } from "./RemoveFileFromRecoveryBank";

export class SaveMappingFileToDeviceAs extends AppCommand {

    /**
     * The suggested name to save the file as.
     */
    public readonly suggestedName: string;

    /**
     * The file's contents.
     */
    public readonly contents: Blob | string;

    private context: ApplicationStore;

    private editor: MappingFileEditor;


    /**
     * Saves a file to the user's file system.
     * @param name
     *  The file's name.
     * @param extension
     *  The file's extension.
     * @param contents
     *  The file's contents.
     * @param saveAs
     * Whether to open a dialog to choose a new name to save the file as.
     */
    constructor(
        context: ApplicationStore,
        editor: MappingFileEditor,
    ) {
        super();
        this.context = context;
        this.editor = editor;
        this.suggestedName = editor.name;
        const file = context.fileAuthority.exportMappingFile(editor.file);
        const json = context.fileSerializer.serialize(file);
        this.contents = json;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        const savedFileName = await Browser.openFileSaveDialog(
            this.suggestedName,
            this.contents,
            ['json']
        );

        // If save was successful...
        if (savedFileName !== null) {
            this.context.activeEditor.name = savedFileName;
            await new RemoveFileFromRecoveryBank(this.context, this.editor).execute();
        }
    }

}
