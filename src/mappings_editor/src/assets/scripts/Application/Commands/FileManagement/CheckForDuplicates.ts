import type { ApplicationStore } from "@/stores/ApplicationStore";
import { AppCommand } from "../AppCommand";
import { GroupCommand } from "../GroupCommand";
import { ReindexMappingObjects } from "../../../MappingFileEditor/EditorCommands/File/ReindexMappingObjects";

export class CheckForDuplicates extends AppCommand {

    private context: ApplicationStore ;

    /**
     * Upgrades the ATT&CK version for the loaded mappings file
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
        const activeFile = this.context.activeEditor.file;
        activeFile.mappingObjects.forEach((mapping, i) => {
            activeFile.mappingObjects.forEach((mappingComparison, j) => {
                if (i === j) { return; }

                // Clear old problems to account for someone clicking detect duplicates twice?

                // A mapping might be a duplicate if the source, target, score value, AND score category are a match
                // A mapping is NOT a duplicate if the comments, references, capability group, or status are different
                if (mapping.sourceObject.objectId === mappingComparison.sourceObject.objectId &&
                     mapping.targetObject.objectId === mappingComparison.targetObject.objectId &&
                     mapping.scoreValue.exportValue === mappingComparison.scoreValue.exportValue &&
                     mapping.scoreCategory.exportValue === mappingComparison.scoreCategory.exportValue
                    ) {
                    mapping.problems.push({
                        problemType: "duplicate",
                        duplicateMappings: [mappingComparison]
                    })
                }
            })
        })
    }
}
