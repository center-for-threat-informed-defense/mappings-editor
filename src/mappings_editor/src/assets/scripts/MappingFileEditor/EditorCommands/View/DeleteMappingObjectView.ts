import { UnselectViewItem } from "./UnselectViewItem";
import { DeleteMappingObject } from "../MappingFile/DeleteMappingObject";
import { RestoreMappingObjectView } from "./RestoreMappingObjectView";
import { CameraCommand, EditorDirectives, GroupCommand } from "..";
import type { MappingObjectView } from "../..";

export class DeleteMappingObjectView extends GroupCommand {
    
    /**
     * Removes a {@link MappingObjectView} from its parent {@link MappingObjectFile}.
     * @param view
     *  The mapping object view to remove.
     */
    constructor(view: MappingObjectView) {
        super();
        const viewportPosition = view.headOffset - view.fileView.viewPosition;
        this.add(new UnselectViewItem(view));
        this.add(new CameraCommand(view.id, viewportPosition, false, false))
        this.add(new RestoreMappingObjectView(view));
        this.add(new DeleteMappingObject(view.object));
    }


    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        return super.undo() | EditorDirectives.ExclusiveSelect;
    }

}
