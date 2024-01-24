import { AppCommand } from "../AppCommand";
import { executeCopy } from "./Clipboard";
import { MappingFileView } from "@/assets/scripts/MappingFileEditor";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileAuthority } from "@/assets/scripts/MappingFileAuthority";
import type { MappingFileSerializer } from "../..";

export class CopySelectedMappingObjects extends AppCommand {

    /**
     * The mapping file authority.
     */
    public readonly fileAuthority: MappingFileAuthority;

    /**
     * The mapping file serializer.
     */
    public readonly fileSerializer: MappingFileSerializer;

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;


    /**
     * Copies the selected {@link MappingObject}s to the clipboard.
     * @param context
     *  The application context.
     * @param fileView
     *  The mapping file view to operate on.
     */
    constructor(context: ApplicationStore, fileView: MappingFileView) {
        super();
        this.fileAuthority = context.fileAuthority as MappingFileAuthority;
        this.fileSerializer = context.fileSerializer;
        this.fileView = fileView;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        executeCopy(this.fileSerializer, this.fileAuthority, this.fileView);
    }

}
