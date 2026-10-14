import { Browser } from "@/assets/scripts/Utilities/Browser";
import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import { RemoveFileFromRecoveryBank } from "./RemoveFileFromRecoveryBank";
import config from "@/assets/configuration/app.config";

export class SaveMappingFileToDeviceAs extends AppCommand {

    private context: ApplicationStore;

    private editor: MappingFileEditor;


    /**
     * Saves a file to the user's file system, giving them the opportunity to rename it
     * before saving.
     * @param context
     *  The application store context.
     * @param editor
     *  The mapping file editor.
     */
    constructor(
        context: ApplicationStore,
        editor: MappingFileEditor,
    ) {
        super();
        this.context = context;
        this.editor = editor;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        let savedFileName = null;

        const file = this.context.fileAuthority.exportMappingFile(this.editor.file);
        const json = this.context.fileSerializer.serialize(file);

        try {
            savedFileName = await Browser.openFileSaveDialog(
                this.editor.name,
                json,
                [config.file_type_extension]
            );
        } catch (error) {
            savedFileName = await this.context.askSaveAsName();
            if (savedFileName) {
                Browser.downloadFile(savedFileName, json, config.file_type_extension);
            }
        }


        // If save was successful...
        if (savedFileName !== null) {
            this.context.activeEditor.name = savedFileName;
            await new RemoveFileFromRecoveryBank(this.context, this.editor).execute();
        }
    }

}
