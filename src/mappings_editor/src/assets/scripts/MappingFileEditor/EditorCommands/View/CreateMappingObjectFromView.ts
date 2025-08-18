import { BreakoutSectionView, createMappingObject, GroupCommand, MappingFileView, type MappingFileViewItem } from "../..";
import type { MappingObject } from "@/assets/scripts/MappingFile";

export class CreateMappingObjectFromView extends GroupCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    /**
     * The new mapping object to add.
     */
    public readonly object: MappingObject;


    /**
     * Creates a new {@link MappingObject}.
     * @param reference
     *  A view item to use as a reference when creating the object.
     */
    constructor(reference: MappingFileViewItem) {
        super();
        this.fileView = reference.fileView;
        // Create object
        const createCommand = createMappingObject(this.fileView.file);
        this.do(createCommand);
        // Apply breakouts
        this.object = createCommand.object;
        for(const section of reference.traverseItemHierarchy()) {
            if(section instanceof BreakoutSectionView) {
                this.do(section.applySectionValue(this.object));
            }
        }
    }

}
