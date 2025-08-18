import { SelectMappingObjectViews } from "./SelectMappingObjectViews";
import { RestoreMappingObjectViews } from "./RestoreMappingObjectViews";
import { MappingObjectView, GroupCommand, deleteMappingObjects } from "../..";

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
        this.do(deleteMappingObjects(this.views.map(v => v.object)));
    }

}
