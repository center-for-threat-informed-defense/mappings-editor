import Configuration from "@/assets/configuration/app.config";
import { GroupCommand } from "../GroupCommand";
import { SaveFileToDevice } from "./SaveFileToDevice";
import { RemoveFileFromRecoveryBank } from "./RemoveFileFromRecoveryBank";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";

export class SaveMappingFileToDevice extends GroupCommand {

    /**
     * Saves a mapping file to the user's file system.
     * @param context
     *  The application context.
     * @param editor
     *  The file's editor.
     * @param saveAs
     * Whether to open a dialog to choose a new name to save the file as.
     */
    constructor(context: ApplicationStore, editor: MappingFileEditor, saveAs: boolean = false) {
        super();
        // Deconstruct file
        const file = context.fileAuthority.exportMappingFile(editor.file);
        // Serialize file
        const json = context.fileSerializer.serialize(file);
        // Save file
        this.add(new SaveFileToDevice(editor.name, Configuration.file_type_extension, json, saveAs));
        this.add(new RemoveFileFromRecoveryBank(context, editor))
    }

}
