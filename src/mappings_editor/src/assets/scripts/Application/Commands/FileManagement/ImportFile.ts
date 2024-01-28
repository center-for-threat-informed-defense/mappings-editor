import { MappingFile } from './../../../MappingFile/MappingFile';
import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { MappingFile } from "@/assets/scripts/MappingFile";

export class ImportFile extends AppCommand {

     /**
     * The file to import.
     */
     private _importedFile: MappingFileEditor;

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
    constructor(context: ApplicationStore, importedFile: json, currentFile: MappingFile) {
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
        let objIds = [];

        this._importedFile.mapping_objects.forEach(mappingObj => {
            const mappingObjExport = this._context.fileAuthority.initializeMappingObjectExport(mappingObj, this._context.activeEditor.file);
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