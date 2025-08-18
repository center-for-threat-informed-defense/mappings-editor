import * as EditorCommand from "@/assets/scripts/MappingFileEditor/EditorCommands"
import { randomUUID } from "@/assets/scripts/Utilities";
import { AppCommand } from "../AppCommand";
import { MappingFileView, Reactivity, type MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
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
     * The mapping file view.
     */
    public readonly view: MappingFileView;

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
        this.view = context.activeFileView as MappingFileView;
        this.editor = editor;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        try {
            const text = await navigator.clipboard.readText();
            const view = this.view;
            const rawFileSerializer = Reactivity.toRaw(this.fileSerializer);
            const convert = Reactivity.toRaw(this.fileAuthority.convertMappingObjectImportToParams);
            // Deserialize items
            const imports = rawFileSerializer.processPaste(text);
            // Compile mapping objects
            const objects = new Map<string, EditorCommand.IdentifiedMappingObjectParameters>();
            for(const obj of imports){
                const objectId = randomUUID()
                objects.set(objectId, { objectId, ...convert(obj) })
            }
            // Compile view command
            const cmd = EditorCommand.createSplitPhaseViewCommand(
                EditorCommand.importMappingObjects(this.editor.file, [...objects.values()]),
                () => [
                    EditorCommand.rebuildViewBreakouts(view),
                    EditorCommand.unselectAllMappingObjectViews(view),
                    EditorCommand.selectMappingObjectViewsById(view, [...objects.keys()]),
                ]
            )
            // Execute insert
            await this.editor.execute(cmd);
            // Move first item into view
            const firstItem = view.getItems(o => objects.has(o.id)).next().value;
            view.moveToViewItem(firstItem.object.id, 0, true, false);
        } catch(reason) {
            console.error("Failed to read clipboard: ", reason);
        }
    }

}
