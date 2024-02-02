import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { MappingFile } from "@/assets/scripts/MappingFile";
import { SaveFileToRecoveryBank } from "./SaveFileToRecoveryBank";
import FlexSearch from "flexsearch"
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
        let searchIndex = this.buildSearchIndex(file);
        this._editor = new MappingFileEditor(file, searchIndex, name);
        this._editor.on("autosave", editor => {
            context.execute(new SaveFileToRecoveryBank(context, editor))
        })
    }

    public buildSearchIndex(file: MappingFile){
        const index = new FlexSearch.Document({
            document: {
                id: 'id',
                index: ["target_object_id", "target_object_text", "source_object_id", "source_object_text", "comments"],
            },
        });
        
        for (const mappingObj of file.mappingObjects) {
            index.add({
                id: mappingObj[0],
                target_object_id: mappingObj[1].targetObject.objectId,
                target_object_text: mappingObj[1].targetObject.objectText,
                source_object_id: mappingObj[1].sourceObject.objectId,
                source_object_text: mappingObj[1].sourceObject.objectText,
                comments: mappingObj[1].comments.value,
            })

        }
        return index;

    }
    /**
     * Executes the command.
     */
    public execute(): void {
        this._context.activeEditor = this._editor;
    }

}
