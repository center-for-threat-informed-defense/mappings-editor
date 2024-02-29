import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { randomUUID } from "@/assets/scripts/Utilities";
import { AppCommand } from "../AppCommand";
import { Reactivity } from "@/assets/scripts/MappingFileAuthority";
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { ListProperty } from "@/assets/scripts/MappingFile";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileAuthority, MappingFileImport } from "@/assets/scripts/MappingFileAuthority";

export class ImportFile extends AppCommand {

    /**
     * The mapping file authority.
     */
    public readonly fileAuthority: MappingFileAuthority;

    /**
     * The mapping file export to import.
     */
    public readonly importFile: MappingFileImport;

    /**
     * The editor to import into.
     */
    public readonly editor: MappingFileEditor;


    /**
     * Imports a mapping file export into the active editor.
     * @param context
     *  The application context.
     * @param importFile
     *  The mapping file export to import.
     */
    constructor(context: ApplicationStore, importFile: MappingFileImport) {
        super();
        this.fileAuthority = context.fileAuthority as MappingFileAuthority;
        this.editor = context.activeEditor as MappingFileEditor;
        const file = this.editor.file;
        // Validate source framework
        if(file.sourceFramework !== importFile.source_framework) {
            throw new Error(
                `The imported file's source framework ('${ 
                    importFile.source_framework
                }') doesn't match this file's source framework ('${
                    file.sourceFramework
                }').`
            );
        }
        // Validate target framework
        if(file.targetFramework !== importFile.target_framework) {
            throw new Error(
                `The imported file's target framework ('${ 
                    importFile.target_framework
                }') doesn't match this file's target framework ('${
                    file.targetFramework
                }').`
            );
        }
        this.importFile = importFile;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        const file = this.editor.file;
        const view = this.editor.view;
        const convert = Reactivity.toRaw(this.fileAuthority.convertMappingObjectImportToParams);
        // Compile mapping objects
        const objects = new Map<string, EditorCommands.IdentifiedMappingObjectParameters>();
        for(const obj of this.importFile.mapping_objects ?? []) {
            const objectId = randomUUID();
            objects.set(objectId, { objectId, ...convert(obj) });
        }
        // Compile insert command
        const insertCmd = EditorCommands.createGroupCommand(
            this.addMissingObjectItems(this.importFile.mapping_types, file.mappingTypes),
            this.addMissingTextItems(this.importFile.capability_groups, file.capabilityGroups),
            this.addMissingTextItems(this.importFile.mapping_statuses, file.mappingStatuses),
            this.addMissingTextItems(this.importFile.score_categories, file.scoreCategories),
            this.addMissingTextItems(this.importFile.score_values, file.scoreValues),
            EditorCommands.importMappingObjects(file, [...objects.values()])
        )
        // Compile view command
        const cmd = EditorCommands.createSplitPhaseViewCommand(
            insertCmd,
            () => [
                EditorCommands.rebuildViewBreakouts(view),
                EditorCommands.unselectAllMappingObjectViews(view),
                EditorCommands.selectMappingObjectViewsById(view, [...objects.keys()])
            ]
        )
        // Execute insert
        this.editor.execute(cmd);
        // Move first item into view
        const firstItem = view.getItems(o => objects.has(o.id)).next().value;
        view.moveToViewItem(firstItem.object.id, 0, true, false);
    }

    /**
     * Inserts missing text items into a {@link ListProperty}.
     * @param obj
     *  The full item list.
     * @param prop
     *  The {@link ListProperty}.
     * @returns
     *  A command that represents the action.
     */
    private addMissingTextItems(obj: { [key: string]: string }, prop: ListProperty) {
        const insertCmd = EditorCommands.createGroupCommand();
        for(const id in obj) {
            if(!prop.findListItemId(i => i.getAsString("id") === id)) {
                const newItem = prop.createNewItem({
                    id   : id,
                    name : obj[id]
                });
                insertCmd.do(EditorCommands.addItemToListProperty(prop, newItem));
            }
        }
        return insertCmd;
    }

    /**
     * Inserts missing object items into a {@link ListProperty}.
     * @param obj
     *  The full item list.
     * @param prop
     *  The {@link ListProperty}.
     * @returns
     *  A command that represents the action.
     */
    private addMissingObjectItems(obj: { [key: string]: { name: string, description: string } }, prop: ListProperty) {
        const insertCmd = EditorCommands.createGroupCommand();
        for(const id in obj) {
            if(!prop.findListItemId(i => i.getAsString("id") === id)) {
                const newItem = prop.createNewItem({ 
                    id          : id,
                    name        : obj[id].name,
                    description : obj[id].description
                });
                insertCmd.do(EditorCommands.addItemToListProperty(prop, newItem));
            }
        }
        return insertCmd;
    }

}
