import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands"
import { randomUUID } from "@/assets/scripts/Utilities";
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
            const rawFileSerializer = Reactivity.toRaw(this.fileSerializer); 
            const convert = Reactivity.toRaw(this.fileAuthority.convertMappingObjectImportToParams);
            // Deserialize items
            const imports = rawFileSerializer.processPaste(text);
            // Compile mapping objects
            const objects = new Map<string, EditorCommands.IdentifiedMappingObjectParameters>();
            for(const obj of imports){
                const objectId = randomUUID()
                objects.set(objectId, { objectId, ...convert(obj) })
            }
            // Compile view command
            const cmd = EditorCommands.createSplitPhaseViewCommand(
                EditorCommands.importMappingObjects(this.editor.file, [...objects.values()]),
                () => [
                    EditorCommands.rebuildViewBreakouts(view),
                    EditorCommands.unselectAllMappingObjectViews(view),
                    EditorCommands.selectMappingObjectViewsById(view, [...objects.keys()]),
                ]
            )
            // Execute insert
            this.editor.execute(cmd);
            // Move first item into view
            const firstItem = view.getItems(o => objects.has(o.id)).next().value;
            view.moveToViewItem(firstItem.object.id, 0, true, false);
        }).catch(reason => {
            console.error("Failed to read clipboard: ", reason);
        })
    }

}
