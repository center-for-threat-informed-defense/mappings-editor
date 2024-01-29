import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";
import type { MappingFileExport } from "@/assets/scripts/MappingFileAuthority";
import { MappingFileEditor, MappingFileView, MappingObjectView } from "@/assets/scripts/MappingFileEditor";

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
        let objects: MappingObject[] = [];
        
        let rawFile = MappingFileView.toRaw(this._context.activeEditor.file);
        let rawFileAuthority = MappingFileView.toRaw(this._context.fileAuthority)
        this._importedFile.mapping_objects.forEach(mappingObj => {
            const mappingObjExport = rawFileAuthority.initializeMappingObjectExport(
                mappingObj, rawFile as MappingFile
            );
            objects.push(mappingObjExport)
            // store ids of inserted objects
            objIds.push(mappingObjExport.id);
        })
        rawFile.insertMappingObjectsAfter(objects);
        this._context.activeEditor.view.rebuildBreakouts();

        // move view to the item in imported items that has the lowest headOffset
        const items = [...this._context.activeEditor.view.getItems(
            o => o instanceof MappingObjectView && objIds.includes(o.id)
        )] as MappingObjectView[];
        const lowestHeadOffset = Object.values(items).reduce((a, b) => b.headOffset < a.headOffset? b : a);
        this._context.activeEditor.view.moveToViewItem(lowestHeadOffset.object.id, 0, true, false);

        // select each inserted object
        objIds.forEach(objId => {
            this._context.activeEditor.view.getItem(objId).select(true);
        })
    }

}
