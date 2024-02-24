import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands"
import { AppCommand } from "../AppCommand";
import { Reactivity, type MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileAuthority } from "@/assets/scripts/MappingFileAuthority";
import type { MappingFileSerializer } from "../..";

export class PasteMappingObjects extends AppCommand {

    /**
     * The mapping file authority.
     */
    public readonly fileAuthority: MappingFileAuthority;

    /**
     * The mapping file serializer.
     */
    public readonly fileSerializer: MappingFileSerializer;

    /**
     * The mapping file editor.
     */
    public readonly editor: MappingFileEditor;


    /**
     * Pastes the clipboard's contents into a {@link MappingFile}.
     * @param context
     *  The application context.
     * @param file
     *  The mapping file editor to operate on.
     */
    constructor(context: ApplicationStore, editor: MappingFileEditor) {
        super();
        this.fileAuthority = context.fileAuthority as MappingFileAuthority;
        this.fileSerializer = context.fileSerializer as MappingFileSerializer;
        this.editor = editor;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        navigator.clipboard.readText().then((text: string) => {
            const view = this.editor.view;
            const rawEditor = Reactivity.toRaw(this.editor);
            const rawFileAuthority = Reactivity.toRaw(this.fileAuthority);
            const rawFileSerializer = Reactivity.toRaw(this.fileSerializer); 
            // Deserialize items
            const file = rawFileAuthority.exportMappingFile(rawEditor.file, false);
            const exports = rawFileSerializer.processPaste(text, file);
            // Configure insert
            const objs = new Map();
            for(const exp of exports){
                // Create object
                const obj = rawFileAuthority.initializeMappingObjectExport(exp, rawEditor.file);
                // Store object id
                objs.set(obj.id, obj);
            }
            // Configure view command
            const cmd = EditorCommands.createSplitPhaseViewCommand(
                EditorCommands.insertMappingObjects(this.editor.file, [...objs.values()]),
                () => [
                    EditorCommands.rebuildViewBreakouts(view),
                    EditorCommands.unselectAllMappingObjectViews(view),
                    EditorCommands.selectMappingObjectViewsById(view, [...objs.keys()]),
                ]
            )
            // Execute insert
            this.editor.execute(cmd);
            // Move first item into view
            const firstItem = view.getItems(o => objs.has(o.id)).next().value;
            view.moveToViewItem(firstItem.object.id, 0, true, false);
        }).catch(reason => {
            console.error("Failed to read clipboard: ", reason);
        })
    }

}
