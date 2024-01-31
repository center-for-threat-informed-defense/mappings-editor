import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";
import type { MappingFileExport } from "@/assets/scripts/MappingFileAuthority";
import { MappingFileView, MappingObjectView } from "@/assets/scripts/MappingFileEditor";

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
        const activeEditorFile = this._context.activeEditor.file;
        // throw error if imported file's source framework does not match the current file's source framework
        if (activeEditorFile.sourceFramework !== this._importedFile.source_framework) {
            alert("The imported file's mapping framework must be the same as the active file's mapping framework.")
            throw new Error(`The imported file's mapping framework must be the same as the active file's mapping framework.`)
        }
        // throw error if imported file's target framework does not match the current file's target framework
        if (activeEditorFile.targetFramework !== this._importedFile.target_framework){
            alert("The imported file's target framework must be the same as the active file's target framework.")
            throw new Error(`The imported file's target framework must be the same as the active file's target framework.`)
        }
        // if versions do not match, explicitly set the imported file's mapping objects to the version
        if (activeEditorFile.sourceVersion !== this._importedFile.source_version) {
            for (const mappingObject of this._importedFile.mapping_objects){
                mappingObject.source_version = this._importedFile.source_version
            }
        }
        if (activeEditorFile.targetVersion !== this._importedFile.target_version) {
            for (const mappingObject of this._importedFile.mapping_objects){
                mappingObject.target_version = this._importedFile.target_version
            }
        }
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        // unselect any items that are currently selected
        this._context.activeEditor.view.setAllItemsSelect(false);

        let objIds: Set<string> = new Set();
        let objects: MappingObject[] = [];
        
        let rawFile = MappingFileView.toRaw(this._context.activeEditor.file);
        let rawFileAuthority = MappingFileView.toRaw(this._context.fileAuthority)
        for (const mappingObj of this._importedFile.mapping_objects){
            const mappingObjExport = rawFileAuthority.initializeMappingObjectExport(
                mappingObj, rawFile as MappingFile
            );
            objects.push(mappingObjExport)
            // store ids of inserted objects
            objIds.add(mappingObjExport.id);
        }
        rawFile.insertMappingObjectsAfter(objects);
        this._context.activeEditor.view.rebuildBreakouts();

        // move view to the item in imported items that has the lowest headOffset
        const topItem = this._context.activeEditor.view.getItems(o => objIds.has(o.id)).next().value;
        this._context.activeEditor.view.moveToViewItem(topItem.object.id, 0, true, false);

        // select each inserted object
        for(const objId of objIds){
            this._context.activeEditor.view.getItem(objId).select(true);
        }
    }

}
