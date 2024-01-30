export * from "./EditorCommand";
export * from "./EditorDirectives";
export * from "./GroupCommand";
export * from "./Property";
export * from "./View";
export * from "./MappingFile"

import { DoNothing } from "./DoNothing";
import { EditorCommand, GroupCommand } from ".";

/**
 * Does nothing.
 * @returns
 *  A command that represents the action.
 */
export function doNothing() {
    return new DoNothing();
}


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
        cmd.do(command);
    }
    return cmd;
}
