import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { MappingFile } from "@/assets/scripts/MappingFile";

export class LoadFile extends AppCommand {

    /**
     * The editor to load.
     */
    private _editor: MappingFileEditor;

    /**
     * The application context.
     */
    private _context: ApplicationStore;


    /**
     * Loads a {@link MappingFile} into the application.
     * @param context
     *  The application context.
     * @param file
     *  The mapping file to load.
     */
    constructor(context: ApplicationStore, file: MappingFile) {
        super();
        this._context = context;
        this._editor = new MappingFileEditor(file);
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        this._context.activeEditor = this._editor;
    }

}
