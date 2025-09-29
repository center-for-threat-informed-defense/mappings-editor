import type { MappingFile, MappingObject } from "../MappingFile";
import { FrameworkComparator } from "./FrameworkComparator";
import type { Framework, FrameworkDiff, FrameworkObject, FrameworkRegistry, FrameworkMigration} from "./FrameworkRegistry";

export class MigrationContext {

    /**
     * A map of framework migrations by mapping file key.
     */
    public readonly migrationContext: Map<string, FrameworkMigration>;


    /**
     * Creates a new {@link MigrationContext}.
     */
    constructor() {
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
    public async buildContext(fileID: string, targetFramework: Framework, sourceFrameworks: Framework[]): Promise<void> {

        // create a new migration context for this mapping file
        const migration: FrameworkMigration = {
            added_framework_objects: [],
            removed_framework_objects: [],
            changed_names: new Map<string, FrameworkObject[]>(),
            changed_descriptions: new Map<string, FrameworkObject[]>(),
            added_mitigations: new Map<string, FrameworkObject[]>(),
            removed_mitigations: new Map<string, FrameworkObject[]>(),
            added_detections: new Map<string, FrameworkObject[]>(),
            removed_detections: new Map<string, FrameworkObject[]>(),
        };

        // iterate through each source framework and compile differences
        sourceFrameworks.forEach((sourceFramework) => {
            const fc: FrameworkComparator = new FrameworkComparator();
            fc.compareFrameworks(sourceFramework, targetFramework);
            migration.added_framework_objects = [...migration.added_framework_objects, ...fc.diff.added_framework_objects];
            migration.removed_framework_objects = [...migration.removed_framework_objects, ...fc.diff.removed_framework_objects];
            migration.changed_names = new Map<string, FrameworkObject[]>([...migration.changed_names.entries(), ...fc.diff.changed_names.entries()]);
            migration.changed_descriptions = new Map<string, FrameworkObject[]>([...migration.changed_descriptions.entries(), ...fc.diff.changed_descriptions.entries()]);
            migration.added_mitigations = new Map<string, FrameworkObject[]>([...migration.added_mitigations.entries(), ...fc.diff.added_mitigations.entries()]);
            migration.removed_mitigations = new Map<string, FrameworkObject[]>([...migration.removed_mitigations.entries(), ...fc.diff.removed_mitigations.entries()]);
            migration.added_detections = new Map<string, FrameworkObject[]>([...migration.added_detections.entries(), ...fc.diff.added_detections.entries()]);
            migration.removed_detections = new Map<string, FrameworkObject[]>([...migration.removed_detections.entries(), ...fc.diff.removed_detections.entries()]);
        });
        this.migrationContext.set(fileID, migration);
    }
}
