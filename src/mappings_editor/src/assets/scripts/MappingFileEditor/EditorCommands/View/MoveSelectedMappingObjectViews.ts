import { GroupCommand } from "..";
import { MoveMappingObjectAfter } from "../MappingFile/MoveMappingObjectAfter";
import { BreakoutSectionView, MappingObjectView, type MappingFileViewItem } from "../..";

export class MoveSelectedMappingObjectViews extends GroupCommand {

    /**
     * The {@link MappingObjectView}s. 
     */
    public readonly views: MappingObjectView[];
    

    /**
     * Moves multiple {@link MappingObjectView}s under the specified
     * {@link MappingFileViewItem}.
     * @param views
     *  The mapping object views to move.
     * @param destination
     *  The destination object.
     */
    constructor(views: MappingObjectView[], destination: MappingFileViewItem) {
        super(false);
        this.views = views;
        // Apply breakouts
        for(const section of destination.traverseItemHierarchy()) {
            if(!(section instanceof BreakoutSectionView)) {
                continue;
            }
            for(const item of this.views) {
                this.do(section.applySectionValue(item.object));
            }
        }
        // Resolve mapping object destination
        let destinationObject = undefined;
        for(const obj of destination.traverseItemsBefore()) {
            if(obj instanceof MappingObjectView) {
                destinationObject = obj;
                break;
            }
        }
        // Move items
        for(let i = 0; i < this.views.length; i++) {
            const object = this.views[i].object;
            const dest = (this.views[i - 1] ?? destinationObject)?.object
            this.do(new MoveMappingObjectAfter(object, dest));
        }
    }
    
}
