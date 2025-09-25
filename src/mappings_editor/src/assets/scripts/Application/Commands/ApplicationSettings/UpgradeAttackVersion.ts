import { MigrationContext } from "@/assets/scripts/MappingFileAuthority/MigrationContext";
import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { Framework, FrameworkRegistry } from "@/assets/scripts/MappingFileAuthority";
import { toRaw } from "vue";
import type { MappingFile } from "@/assets/scripts/MappingFile";


export class UpgradeAttackVersion extends AppCommand {
    /**
     * The framework's source.
     */
    public readonly newVersion: string;

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
    constructor(context: ApplicationStore, newVersion: string) {
        super();
        this.context = context;
        this.newVersion = newVersion;
    }

    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {

        // Build migration context from currently loaded mapping file
        const fileAuthority = toRaw(this.context.fileAuthority);
        const migrationContext: MigrationContext = new MigrationContext();
        const frameworkId = this.context.activeEditor.file.targetFramework;
        const targetFramework = await fileAuthority.registry.getFramework(frameworkId, this.newVersion);
        const sourceFrameworks = await this.getSourceFrameworks();
        migrationContext.buildContext(this.context.activeEditor.file.id, targetFramework, sourceFrameworks);
        // Audit mapping objects against migration context
        const frameworkMigration = migrationContext.migrationContext.get(this.context.activeEditor.file.id);
        if (frameworkMigration) {
            this.context.activeEditor.file.mappingObjects.forEach((mappingObject) =>
                // update mapping object with any problems
                fileAuthority.auditMappingObject(mappingObject, frameworkMigration)
            )
        }
        // set file version to new version
        this.context.activeEditor.file.targetVersion = this.newVersion;
    }

    /**
     * Get unique set of source frameworks from all mappings in the mapping file
     * @param file
     * The mapping file to migrate
     */
    private async getSourceFrameworks(): Promise<Framework[]> {

        const frameworks: Framework[] = [];

        // get all framework ids and framework versions in mapping objects
        const frameworkValueMap: Map<string, string> = new Map<string, string>();
        for (const mappingObject of this.context.activeEditor.file.mappingObjects.values()) {
            frameworkValueMap.set(mappingObject.targetObject.objectFramework, mappingObject.targetObject.objectVersion);
        }

        // fetch unique frameworks in mapping objects
        const fileAuthority = toRaw(this.context.fileAuthority);
        const registry = fileAuthority.registry;
        for (const [id, version] of frameworkValueMap.entries()) {
            try {
                const framework = await registry.getFramework(id, version);
                frameworks.push(framework);
            } catch {
                continue;
            }
        }
        return frameworks;
    }
}
