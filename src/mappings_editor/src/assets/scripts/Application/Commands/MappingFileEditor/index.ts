import { AppCommand } from "../AppCommand";
import { UndoEditorCommand } from "./UndoEditorCommand";
import { RedoEditorCommand } from "./RedoEditorCommand";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";

/**
 * Undoes the last editor command.
 * @param editor
 *  The {@link MappingFileEditor}.
 * @returns
 *  A command that represents the action.
 */
export function undoEditorCommand(editor: MappingFileEditor): AppCommand {
    return new UndoEditorCommand(editor);
}

/**
 * Redoes the last undone editor command.
 * @param editor
 *  The {@link MappingFileEditor}.
 * @returns
 *  A command that represents the action.
 */
export function redoEditorCommand(editor: MappingFileEditor): AppCommand {
    return new RedoEditorCommand(editor);
}
