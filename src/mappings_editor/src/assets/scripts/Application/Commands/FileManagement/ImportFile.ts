import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { MappingFile } from "@/assets/scripts/MappingFile";
import type { MappingFileExport } from "@/assets/scripts/MappingFileAuthority";

export class ImportFile extends AppCommand {

     /**
     * The file to import.
     */
     private _importedFile: MappingFileExport;

    /**
     * The application context.
     */
    private _context: ApplicationStore;


    /**
     * Loads a new mapping objects from an imported file into the application.
     * @param context
     *  The application context.
     * @param importedFile
     *  The mapping file to load merge.
     */
    constructor(context: ApplicationStore, importedFile: MappingFileExport) {
        super();
        this._context = context;
        this._importedFile = importedFile;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        // unselect any items that are currently selected
        this._context.activeEditor.view.setAllItemsSelect(false);
        let objIds: string[] = [];

        this._importedFile.mapping_objects.forEach(mappingObj => {
            const mappingObjExport = this._context.fileAuthority.initializeMappingObjectExport(
                mappingObj, this._context.activeEditor.file as MappingFile
            );
            this._context.activeEditor.file.insertMappingObject(mappingObjExport);
            // store ids of inserted objects
            objIds.push(mappingObjExport.id);
        })
        this._context.activeEditor.view.rebuildBreakouts();
        // move view to the first inserted object
        this._context.activeEditor.view.moveToViewItem(objIds[0], 0, true, false);
        // select each inserted object
        objIds.forEach(objId => {
            this._context.activeEditor.view.getItem(objId).select(true);
        })
    }

}
