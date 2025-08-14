import { AppCommand } from "../AppCommand";
import { 
    CopySelectedMappingObjects,
    CutSelectedMappingObjects,
    PasteMappingObjects,
    RedoEditorCommand,
    UndoEditorCommand
} from "./index.commands";
import type { MappingFileView } from "@/assets/scripts/MappingFileView";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";


/**
 * Cuts selected mapping object's to the clipboard.
 * @param context
 *  The application context.
 * @param editor
 *  The mapping file editor to operate on.
 * @param fileView
 *  The mapping file view to operate on.
 */
export function cutEditorCommand(context: ApplicationStore, editor: MappingFileEditor, fileView: MappingFileView) {
    return new CutSelectedMappingObjects(context, editor, fileView);
}

/**
 * Copies selected mapping object's to the clipboard.
 * @param context
 *  The application context.
 * @param fileView
 *  The mapping file view to operate on.
 */
export function copySelectedMappingObjects(context: ApplicationStore, fileView: MappingFileView) {
    return new CopySelectedMappingObjects(context, fileView);
}

/**
 * Pastes the clipboard's contents into a {@link MappingFile}.
 * @param context
 *  The application context.
 * @param editor
 *  The mapping file editor to operate on.
 */
export function pasteMappingObjects(context: ApplicationStore, editor: MappingFileEditor) {
    return new PasteMappingObjects(context, editor);
}

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
