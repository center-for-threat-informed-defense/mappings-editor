import { SelectMappingObjectViews } from "./SelectMappingObjectViews";
import { RestoreMappingObjectViews } from "./RestoreMappingObjectViews";
import { deleteMappingObject, GroupCommand } from "..";
import type { MappingFileView, MappingObjectView } from "@/assets/scripts/MappingFileView";

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
        this.do(deleteMappingObject(view.object));
        this.do(new RestoreMappingObjectViews(view));
    }

}
