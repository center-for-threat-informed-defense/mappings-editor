import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { MappingFile } from "@/assets/scripts/MappingFile";
import { SaveFileToRecoveryBank } from "./SaveFileToRecoveryBank";

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
        this._context.activeEditor = this._editor;
    }

}
