import type { MappingFile, MappingObject } from "../MappingFile";
import { FrameworkComparator } from "./FrameworkComparator";
import type { Framework, FrameworkDiff, FrameworkObject, FrameworkRegistry, FrameworkMigration} from "./FrameworkRegistry";

export class MigrationContext {

    /**
     * Framework registry.
     */
    public readonly registry: FrameworkRegistry;

    /**
     * List of source frameworks.
     */
    public sourceFrameworks: Framework[];

    /**
     * A map of framework migrations by mapping file key.
     */
    public readonly migrationContext: Map<string, FrameworkMigration>;


    /**
     * Creates a new {@link MigrationContext}.
     * @param registry
     *  The framework comparator's framework registry.
     */
    constructor(registry: FrameworkRegistry) {
        this.registry = registry;
        this.sourceFrameworks = [];
        this.migrationContext = new Map<string, FrameworkMigration>();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Compile all framework migration differences  ///////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Iterate through each source framework and compile target framework updates
     * @param file
     *  The mapping file to migrate
     * @param targetFramework
     *  The framework to migrate the mapping file to.
     */
    public async buildContext(file: MappingFile, targetFramework: Framework): Promise<void> {

        // get all source frameworks from target objects in mapping file
        const sourceFrameworks = await this.getSourceFrameworks(file);

        // create a new migration context for this mapping file
        const migration: FrameworkMigration = {
            added_framework_objects: [],
            removed_framework_objects: [],
            changed_names: new Map<string, [string, string]>(),
            changed_descriptions: new Map<string, [string, string]>(),
            added_mitigations: new Map<string, FrameworkObject[]>(),
            removed_mitigations: new Map<string, FrameworkObject[]>(),
            added_detections: new Map<string, FrameworkObject[]>(),
            removed_detections: new Map<string, FrameworkObject[]>(),
        };

        // iterate through each source framework and compile differences
        sourceFrameworks.forEach((sourceFramework) => {
            let fc: FrameworkComparator = new FrameworkComparator();
            fc.compareFrameworks(sourceFramework, targetFramework);
            migration.added_framework_objects = [...migration.added_framework_objects, ...fc.diff.added_framework_objects];
            migration.removed_framework_objects = [...migration.removed_framework_objects, ...fc.diff.removed_framework_objects];
            migration.changed_names = new Map<string, [string, string]>([...migration.changed_names.entries(), ...fc.diff.changed_names.entries()]);
            migration.changed_descriptions = new Map<string, [string, string]>([...migration.changed_descriptions.entries(), ...fc.diff.changed_descriptions.entries()]);
            migration.added_mitigations = new Map<string, FrameworkObject[]>([...migration.added_mitigations.entries(), ...fc.diff.added_mitigations.entries()]);
            migration.removed_mitigations = new Map<string, FrameworkObject[]>([...migration.removed_mitigations.entries(), ...fc.diff.removed_mitigations.entries()]);
            migration.added_detections = new Map<string, FrameworkObject[]>([...migration.added_detections.entries(), ...fc.diff.added_detections.entries()]);
            migration.removed_detections = new Map<string, FrameworkObject[]>([...migration.removed_detections.entries(), ...fc.diff.removed_detections.entries()]);
        });
        this.migrationContext.set(file.id, migration);
    }

    /**
     * Get unique set of source frameworks from all mappings in the mapping file
     * @param file
     * The mapping file to migrate
     */
    private async getSourceFrameworks(file: MappingFile): Promise<Framework[]> {

        const frameworks: Framework[] = [];

        // get all framework ids and framework versions in mapping objects
        const frameworkValueMap: Map<string, string> = new Map<string, string>();
        for (const mappingObject of file.mappingObjects.values()) {
            frameworkValueMap.set(mappingObject.targetObject.objectFramework, mappingObject.targetObject.objectVersion);
        }

        // fetch unique frameworks in mapping objects
        for (const [id, version] of frameworkValueMap.entries()) {
            try {
                const framework = await this.registry.getFramework(id, version);
                frameworks.push(framework);
            } catch {
                continue;
            }
        }
        return frameworks;
    }


}
