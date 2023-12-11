import { CameraCommand, EditorCommand, GroupCommand } from ".";

/**
 * Creates a new {@link GroupCommand}.
 * @param commands
 *  A list of {@link EditorCommand}s.
 * @returns
 *  A command that represents the action.
 */
export function createGroupCommand(...commands: EditorCommand[]) {
    const cmd = new GroupCommand();
    for(const command of commands) {
        cmd.add(command);
    }
    return cmd;
}

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
 *  the item exists outside the current viewport. (Default: `false`)
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToViewItem(id: string, position: number, fromHangers: boolean = false, strict: boolean = false): EditorCommand {
    return new CameraCommand(id, position, fromHangers, strict);
}
