import { AppCommand } from "../AppCommand";
import { UndoEditorCommand } from "./UndoEditorCommand";
import { RedoEditorCommand } from "./RedoEditorCommand";
import { PasteMappingObjects } from "./PasteMappingObjects";
import { CopySelectedMappingObjects } from "./CopySelectedMappingObjects";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileEditor, MappingFileView } from "@/assets/scripts/MappingFileEditor";
import { CutSelectedMappingObjects } from "./CutSelectedMappingObjects";
import { GroupCommand } from "../GroupCommand";
import { AutoMigrateFile } from "../FileManagement/AutoMigrateFile";


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
    const grp = new GroupCommand();
    grp.add(new PasteMappingObjects(context, editor));
    grp.add(new AutoMigrateFile(context));
    return grp;
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
