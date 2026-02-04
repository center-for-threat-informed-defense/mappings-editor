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
        console.log("up here")
        const activeFile = this.context.activeEditor.file;

        activeFile.mappingObjects.forEach((mapping, i) => {
            console.log("finding duplicates for ", mapping)
            activeFile.mappingObjects.forEach((mappingComparison, j) => {
            console.log("checking nested duplicates for ", mapping, mappingComparison)

                if (i === j) { return; }
                // A mapping might be a duplicate if the source, target, score value, AND score category are a match
                if (mapping.sourceObject.objectId === mappingComparison.sourceObject.objectId &&
                     mapping.targetObject.objectId === mappingComparison.targetObject.objectId &&
                     mapping.scoreValue === mappingComparison.scoreValue&&
                     mapping.scoreCategory === mappingComparison.scoreCategory
                    ) {
                    mapping.problems.push({
                        problemType: "duplicate",
                        duplicateMappings: [mappingComparison]
                    })
                }
                else {
                    console.log("not a problem",mapping.sourceObject.objectId === mappingComparison.sourceObject.objectId ,
                    mapping.targetObject.objectId === mappingComparison.targetObject.objectId)
                }
            })
        })
    }
}
