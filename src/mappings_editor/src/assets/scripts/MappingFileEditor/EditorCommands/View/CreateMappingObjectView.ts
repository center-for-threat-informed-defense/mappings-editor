import { CreateMappingObject } from "../MappingFile/CreateMappingObject";
import { BreakoutSectionView, type MappingFileViewItem } from "../..";
import { CameraCommand, EditorDirectives, GroupCommand } from "..";

export class CreateMappingObjectView extends GroupCommand {
    
    /**
     * Creates a new {@link MappingObjectView}.
     * @param source
     *  The view item the new object should be created under.
     */
    constructor(source: MappingFileViewItem) {
        super();
        const view = source.fileView;
        // Create object
        const createCommand = new CreateMappingObject(view.file);
        const createObject = createCommand.object;
        this.add(createCommand);
        // Apply breakouts
        let nextLevel = null;
        for(let obj = source; obj; obj = obj.prev!) {
            const isNextLevel = nextLevel === null || nextLevel === obj.level;
            if(obj instanceof BreakoutSectionView && isNextLevel) {
                this.add(obj.applySectionValue(createObject));
                nextLevel = obj.level - 1;
            }
            if(nextLevel === -1) { 
                break;
            }
        }
        this.add(new CameraCommand(createObject.id, 0, true, false));
    }
    

    /**
     * Applies the set of commands.
     * @returns
     *  The editor's directives.
     */
    public execute(): EditorDirectives {
        return super.execute() | EditorDirectives.ExclusiveSelect;
    }

}
