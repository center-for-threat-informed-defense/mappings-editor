import { MappingFileViewItem } from ".";
import type { MappingObject } from "@/assets/scripts/MappingFile";
import type { MappingFileView } from "..";

export class MappingObjectView extends MappingFileViewItem {

    /**
     * The mapping object.
     */
    public object: MappingObject;


    /**
     * The object's id.
     */
    public get id(): string {
        return this.object.id;
    }


    /**
     * Creates a new {@link MappingObjectView}.
     * @param file
     *  The mapping file view the item belongs to.
     * @param object
     *  The underlying {@link MappingObject}.
     */
    constructor(file: MappingFileView, object: MappingObject) {
        super(file);
        this.object = object;
        this.collapsed = true;
    }

}
