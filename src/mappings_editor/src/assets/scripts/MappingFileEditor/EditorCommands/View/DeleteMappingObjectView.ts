import { GroupCommand } from "..";
import { DeleteMappingObject } from "../File/DeleteMappingObject";
import { RestoreMappingObjectViews } from "./RestoreMappingObjectViews";
import type { MappingFileView, MappingObjectView } from "../..";
import { SelectMappingObjectViews } from "./SelectMappingObjectViews";

export class DeleteMappingObjectView extends GroupCommand {
    
    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;


    /**
     * Deletes a {@link MappingObjectView} and its underlying mapping object
     * from its mapping file.
     * @remarks
     *  Do not use this command to remove multiple {@link MappingObjectView}s
     *  at once, use {@link DeleteMappingObjectViews} instead.
     * @param view
     *  The mapping object view to delete.
     */
    constructor(view: MappingObjectView) {
        super();
        this.fileView = view.fileView;
        this.do(new SelectMappingObjectViews(view, false, true))
        this.do(new DeleteMappingObject(view.object));
        this.do(new RestoreMappingObjectViews(view));
    }

}
