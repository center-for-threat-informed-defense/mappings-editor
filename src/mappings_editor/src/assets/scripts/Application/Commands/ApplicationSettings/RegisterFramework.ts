import { toRaw } from "vue";
import { AppCommand } from "../AppCommand";
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { MappingFile } from "@/assets/scripts/MappingFile";
import type { FrameworkSource } from "@/assets/scripts/MappingFileAuthority";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import { LoadFile } from "../FileManagement/LoadFile";

export class RegisterFramework extends AppCommand {

    /**
     * The framework's source.
     */
    public readonly framework: FrameworkSource;

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Registers a Framework with the application.
     * @param context
     *  The application context.
     * @param framework
     *  The framework's source.
     */
    constructor(context: ApplicationStore, framework: FrameworkSource) {
        super();
        this.context = context;
        this.framework = framework;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        // Create raw references
        const fileAuthority = toRaw(this.context.fileAuthority);
        // Register framework
        fileAuthority.registry.registerFramework(this.framework);
        // Export
        const { id, version: ver } = this.framework;
        const file = toRaw(this.context.activeEditor.file) as MappingFile;
        if(
            (id === file.sourceFramework && ver === file.sourceVersion) ||
            (id === file.targetFramework && ver === file.targetVersion)
        ) {
            fileAuthority.reloadMappingFile(file).then(file => {
                this.context.activeEditor.tryDispatchOutstandingAutosave();
                this.context.execute(new LoadFile(this.context, file));
            });
        }
    }

}
