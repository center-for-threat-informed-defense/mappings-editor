import type { ApplicationStore } from "@/stores/ApplicationStore";
import { AppCommand } from "../AppCommand";
import { GroupCommand } from "@/assets/scripts/MappingFileEditor";
import { PatchMappingObject } from "@/assets/scripts/MappingFileEditor/EditorCommands/File/PatchMappingObject";
import type { Framework } from "@/assets/scripts/MappingFileAuthority";
import { toRaw } from "vue";
import type { MigrationContext } from "@/assets/scripts/MappingFileAuthority/MigrationContext";

export class AutoMigrateFile extends AppCommand {

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Auto-migrates the active editor.
     * @param context
     * The application context.
     */
    constructor(context: ApplicationStore) {
        super();
        this.context = context;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {

        // Get migration context for currently loaded mapping file if it's been computed
        const fileAuthority = toRaw(this.context.fileAuthority);
        const migrationContext = toRaw(this.context.migrationContext);
        const activeFile = this.context.activeEditor.file;
        const hasFrameworkMigration = migrationContext.migrationContext.has(activeFile.id);

        // If migration hasn't been computed yet, compute it
        if (!hasFrameworkMigration) {
            const targetFramework = await fileAuthority.registry.getFramework(activeFile.targetFramework, activeFile.targetVersion);
            const sourceFrameworks = await this.getSourceFrameworks();
            await migrationContext.buildContext(activeFile.id, targetFramework, sourceFrameworks);
        }
        const frameworkMigration = migrationContext.migrationContext.get(activeFile.id);

        // Audit mapping objects against migration context
        const grp = new GroupCommand();
        if (frameworkMigration) {
            activeFile.mappingObjects.forEach((mappingObject) => {
                // update mapping object with any problems
                fileAuthority.auditMappingObject(mappingObject, frameworkMigration);
                // if no problems, update mapping object with new version
                if (mappingObject.problems.length === 0) {
                    grp.do(new PatchMappingObject(mappingObject));
                }
            });
        }

        // Update version on mapping objects with no problems
        await this.context.activeEditor.execute(grp);
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
