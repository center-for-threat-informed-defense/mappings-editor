import { EditorCommand } from "./EditorCommand";
import { EditorDirectives } from ".";

export class CameraCommand extends EditorCommand {

    /**
     * The view item's id.
     */
    public readonly id: string;

    /**
     * The view item's location in the viewport.
     */
    public readonly position: number;

    /**
     * If true, the position will be relative to the breakout hangers' base.
     * If false, the position will be relative to the viewport's head.
     */
    public readonly fromHangers: boolean;

    /**
     * If true, the camera WILL move to the specified viewport position. If
     * false, the camera will only move to the specified viewport position if
     * the item exists outside the current viewport.
     */
    public readonly strict: boolean;


    /**
     * Moves the camera to a {@link MappingFileViewItem}.
     * @param id
     *  The view item's id.
     * @param position
     *  The view item's location in the viewport.
     * @param fromHangers
     *  If true, the position will be relative to the breakout hangers' base.
     *  If false, the position will be relative to the viewport's head.
     * @param strict
     *  If true, the camera WILL move to the specified viewport position. If
     *  false, the camera will only move to the specified viewport position if
     *  the item exists outside the current viewport.
     * @param includeHangHeight
     *  If true, the camera will account
     */
    constructor(id: string, position: number, fromHangers: boolean, strict: boolean) {
        super();
        this.id = id;
        this.position = position;
        this.fromHangers = fromHangers;
        this.strict = strict;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        return EditorDirectives.MoveCamera;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        return EditorDirectives.MoveCamera;
    }

}
