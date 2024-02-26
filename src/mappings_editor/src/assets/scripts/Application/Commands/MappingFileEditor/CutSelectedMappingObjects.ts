import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { AppCommand } from "../AppCommand";
import { executeCopy } from "./Clipboard";
import { MappingFileView, MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileAuthority } from "@/assets/scripts/MappingFileAuthority";
import type { MappingFileSerializer } from "../..";

export class CutSelectedMappingObjects extends AppCommand {

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
    public readonly fileView: MappingFileView;


    /**
     * Cuts selected {@link MappingObject}s to the clipboard.
     * @param context
     *  The application context.
     * @param editor
     *  The mapping file editor to operate on.
     * @param fileView
     *  The mapping file view to operate on.
     */
    constructor(context: ApplicationStore, editor: MappingFileEditor, fileView: MappingFileView) {
        super();
        this.fileAuthority = context.fileAuthority as MappingFileAuthority;
        this.fileSerializer = context.fileSerializer as MappingFileSerializer;
        this.fileView = fileView;
        this.editor = editor;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        // Copy selected objects
        const items = executeCopy(this.fileSerializer, this.fileAuthority, this.fileView);
        // Delete selected objects
        this.editor.execute(EditorCommands.deleteMappingObjectViews(items));
    }

}
