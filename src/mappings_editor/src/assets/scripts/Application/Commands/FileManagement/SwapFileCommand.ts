import { GroupCommand } from "../GroupCommand";
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

    /**
     * Swaps the mapping file {@link MappingFile} in a mapping file editor {@link MappingFileEditor}.
     * @param file
     *  The mapping file to operate on.
     */
    constructor(file: MappingFile, context: ApplicationStore) {
        super();
        this.context = context;
        this.mappingFile = file;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        // swap file
        this.context.activeEditor.file = this.mappingFile;
        // rebuild brekouts to reflect change in view
        this.context.activeEditor.view.rebuildBreakouts();
        // unselect all currently selected objects
        this.context.activeEditor.view.unselectAllViewItems();
        // select all new objects and move view to the first new object
        let moved = false;
        this.mappingFile.mappingObjects.forEach(mappingObject => {
            if (mappingObject.imported){
                this.context.activeEditor.view.selectViewItem(mappingObject.id)
                !moved && (this.context.activeEditor.view.moveToViewItem(mappingObject.id, 0, true, false));
                moved = true;
            }
        })
    }
}
