import { CameraCommand, EditorDirectives, GroupCommand } from "..";
import type { EditorCommand, MappingObjectView } from "../..";

export class AlterMappingObjectViewProperty extends GroupCommand {
    
    /**
     * Alters a {@link MappingObjectView}'s property.
     * @param view
     *  The mapping object view to manipulate.
     * @param command
     *  The {@link EditorCommand} that alters the underlying
     *  {@link MappingObject}.
     */
    constructor(view: MappingObjectView, command: EditorCommand) {
        super();
        const viewportPosition = view.headOffset - view.fileView.viewPosition;
        this.add(new CameraCommand(view.id, viewportPosition, false, false))
        this.add(command);
    }


    /**
     * Redoes the editor command.
     * @returns
     *  The command's directives.
     */
    public redo(): EditorDirectives {
        return super.redo() | EditorDirectives.ExclusiveSelect;
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
