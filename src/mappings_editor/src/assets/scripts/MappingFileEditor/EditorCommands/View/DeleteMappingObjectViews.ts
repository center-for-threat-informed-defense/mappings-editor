import { DeleteMappingObject } from "../File/DeleteMappingObject";
import { SelectMappingObjectViews } from "./SelectMappingObjectViews";
import { RestoreMappingObjectViews } from "./RestoreMappingObjectViews";
import { MappingObjectView, GroupCommand } from "../..";

export class DeleteMappingObjectViews extends GroupCommand {

    /**
     * The {@link MappingObjectView}s.
     */
    public readonly views: MappingObjectView[];


    /**
     * Deletes multiple {@link MappingObjectView}s and their underlying
     * mapping objects from their mapping file.
     * @param views
     *  The mapping object views to delete.
     */
    constructor(views: MappingObjectView[]) {
        super();
        this.views = views;
        this.do(new SelectMappingObjectViews(this.views, false, true))
        this.do(new RestoreMappingObjectViews(this.views));
        for(let i = this.views.length - 1; 0 <= i; i--) {
            this.do(new DeleteMappingObject(this.views[i].object))
        } 
    }

}
