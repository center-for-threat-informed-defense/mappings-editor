import { GroupCommand } from "..";
import { CreateMappingObject } from "../File/CreateMappingObject";
import { BreakoutSectionView, MappingFileView, type MappingFileViewItem } from "../..";
import type { MappingObject } from "@/assets/scripts/MappingFile";

export class CreateMappingObjectView extends GroupCommand {
    
    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    /**
     * The new mapping object to add.
     */
    public readonly object: MappingObject;


    /**
     * Creates a new {@link MappingObjectView}.
     * @param destination
     *  The view item the new object should be created under.
     */
    constructor(destination: MappingFileViewItem) {
        super();
        this.fileView = destination.fileView;
        // Create object
        const createCommand = new CreateMappingObject(this.fileView.file);
        this.object = createCommand.object;
        this.do(createCommand);
        // Apply breakouts
        for(const section of destination.traverseItemHierarchy()) {
            if(section instanceof BreakoutSectionView) {
                this.do(section.applySectionValue(this.object));
            }
        }
    }
    
}
