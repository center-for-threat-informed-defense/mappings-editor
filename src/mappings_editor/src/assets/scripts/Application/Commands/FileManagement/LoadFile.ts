import { AppCommand } from "../AppCommand";
import { MappingFileView, ValueViewFilter } from "@/assets/scripts/MappingFileView";
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import { SaveFileToRecoveryBank } from "./SaveFileToRecoveryBank";
import type { MappingFile } from "@/assets/scripts/MappingFile";
import type { ApplicationStore } from "@/stores/ApplicationStore";

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
    constructor(context: ApplicationStore, file: MappingFile);

    /**
     * Loads a {@link MappingFile} into the application.
     * @param context
     *  The application context.
     * @param file
     *  The mapping file to load.
     * @param name
     *  The mapping file's name.
     */
    constructor(context: ApplicationStore, file: MappingFile, name?: string);
    constructor(context: ApplicationStore, file: MappingFile, name?: string) {
        super();
        this._context = context;
        this._editor = new MappingFileEditor(file, name);
        this._editor.on("autosave", editor => {
            context.execute(new SaveFileToRecoveryBank(context, editor))
        })
    }

    
    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        // Configure active editor
        this._context.activeEditor = this._editor;
    }

}
