import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { AppCommand } from "../AppCommand";
import { MappingFileEditor, Reactivity } from "@/assets/scripts/MappingFileEditor";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileAuthority, MappingFileImport } from "@/assets/scripts/MappingFileAuthority";

export class ImportFile extends AppCommand {

    /**
     * The editor to import into.
     */
    public readonly editor: MappingFileEditor;

    /**
     * The mapping file authority to use.
     */
    public readonly fileAuthority: MappingFileAuthority;

    /**
     * The mapping file export to import.
     */
    public readonly importFile: MappingFileImport;


    /**
     * Imports a mapping file export into the active editor.
     * @param context
     *  The application context.
     * @param importFile
     *  The mapping file export to import.
     */
    constructor(context: ApplicationStore, importFile: MappingFileImport) {
        super();
        this.editor = context.activeEditor as MappingFileEditor;
        this.fileAuthority = context.fileAuthority as MappingFileAuthority;
        // Validate source framework
        if(this.editor.file.sourceFramework !== importFile.source_framework) {
            throw new Error(
                `The imported file's source framework ('${ 
                    importFile.source_framework
                }') doesn't match this file's source framework ('${
                    this.editor.file.sourceFramework
                }').`
            );
        }
        // Validate target framework
        if(this.editor.file.targetFramework !== importFile.target_framework) {
            throw new Error(
                `The imported file's target framework ('${ 
                    importFile.target_framework
                }') doesn't match this file's target framework ('${
                    this.editor.file.targetFramework
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
        const rawEditor = Reactivity.toRaw(this.editor);
        const rawFileAuthority = Reactivity.toRaw(this.fileAuthority);
        // Compile mapping items
        const objs = new Map();
        for(const exp of this.importFile.mapping_objects ?? []) {
            const obj = rawFileAuthority.initializeMappingObjectImport(exp, rawEditor.file);
            objs.set(obj.id, obj);
        }
        // Configure view command
        const cmd = EditorCommands.createSplitPhaseViewCommand(
            EditorCommands.insertMappingObjects(file, [...objs.values()]),
            () => [
                EditorCommands.rebuildViewBreakouts(view),
                EditorCommands.unselectAllMappingObjectViews(view),
                EditorCommands.selectMappingObjectViewsById(view, [...objs.keys()])
            ]
        )
        // Execute insert
        this.editor.execute(cmd);
        // Move first item into view
        const firstItem = view.getItems(o => objs.has(o.id)).next().value;
        view.moveToViewItem(firstItem.object.id, 0, true, false);
    }

}
