import { GroupCommand } from "../GroupCommand";
import { MappingFile } from './../../../MappingFile/MappingFile';
import { MappingFileEditor } from '@/assets/scripts/MappingFileEditor';
import type { MappingFile } from "@/assets/scripts/MappingFile";
import type { ApplicationStore } from '@/stores/ApplicationStore';

export class SwapMappingFile extends GroupCommand {
    
    /**
     * The new file to swap.
     */
    public readonly mappingFile: MappingFile;

    /**
     * The application context.
     */
    private context: ApplicationStore;

    private readonly amountNewMappingObjects
    /**
     * Swaps the mapping file {@link MappingFile} in a mapping file editor {@link MappingFileEditor}.
     * @param file
     *  The mapping file to operate on.
     */
    constructor(file: MappingFile, context: ApplicationStore, amountNewMappingObjects: Array) {
        super();
        this.context = context;
        this.mappingFile = file;
        this.amountNewMappingObjects = amountNewMappingObjects;
    }


    /**
     * Executes the editor command.
     */
    public execute(): void {
        this.context.activeEditor.file = this.mappingFile;
        this.context.activeEditor.view.rebuildBreakouts();
        let mappingObjectIds = Array.from(this.mappingFile.mappingObjects.keys())
        let newMappingObjectIds = mappingObjectIds.slice(mappingObjectIds.length - this.amountNewMappingObjects);
        this.context.activeEditor.view.unselectAllViewItems();
        let moved = false;
        this.mappingFile.mappingObjects.forEach((mappingObject, id)=> {
            if (newMappingObjectIds.includes(id)){
                this.context.activeEditor.view.selectViewItem(id)
                !moved && (this.context.activeEditor.view.moveToViewItem(mappingObject.id, 0, true, false));
                moved = true;
            }
        })
    }
}
