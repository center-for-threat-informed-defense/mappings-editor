import { toRaw } from "vue";
import { LoadFile } from "../FileManagement/LoadFile";
import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFile } from "@/assets/scripts/MappingFile";

export class UnloadStoredFrameworks extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Deregisters and deletes all Frameworks stored in the application's
     * Framework Bank.
     * @param context
     *  The application context.
     */
    constructor(context: ApplicationStore) {
        super();
        this.context = context;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        // Create raw references
        const fileAuthority = toRaw(this.context.fileAuthority);
        const frameworkBank = this.context.frameworkBank;
        const { sourceFramework, sourceVersion } = this.context.activeEditor.file;
        const { targetFramework, targetVersion } = this.context.activeEditor.file;
        // Deregister frameworks
        let reloadFile = false;
        for(const [fileId, file] of this.context.frameworkBank.files) {
            const { id, version } = JSON.parse(file.name);
            // Determine if file reload is necessary
            reloadFile ||=
                (id === sourceFramework && version === sourceVersion) ||
                (id === targetFramework && version === targetVersion);
            // Remove framework from registry
            fileAuthority.registry.deregisterFramework(id, version);
            // Delete framework from framework bank
            frameworkBank.deleteFile(fileId);
        }
        // Reload open file
        if(reloadFile) {
            const file = toRaw(this.context.activeEditor.file) as MappingFile;
            const reloadedFile = await fileAuthority.reloadMappingFile(file);
            new LoadFile(this.context, reloadedFile).execute();
        }
    }

}
