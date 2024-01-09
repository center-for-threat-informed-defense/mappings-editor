import { Browser } from "@/assets/scripts/Utilities/Browser";
import { LoadFile } from "./LoadFile";
import { AppCommand } from "../AppCommand";
import { ClearFileRecoveryBank } from "./ClearFileRecoveryBank";
import { SaveMappingFileToDevice } from "./SaveMappingFileToDevice";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileExport } from "@/assets/scripts/MappingFileAuthority";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";

/**
 * Loads an empty mapping file into the application.
 * @param context
 *  The application's context.
 * @param settings
 *  The mapping file's settings.
 * @returns
 *  A command that represents the action.
 */
export async function loadNewFile(context: ApplicationStore, settings: MappingFileExport): Promise<AppCommand> {
    // Create file
    const mappingFile = await context.fileAuthority.createEmptyMappingFile(settings);
    // Return command
    return new LoadFile(context, mappingFile);
}

/**
 * Loads a mapping file export into the application.
 * @param context
 *  The application's context.
 * @param file
 *  The file export.
 * @param name
 *  The file's name.
 * @param id
 *  The file's id.
 * @returns
 *  A command that represents the action.
 */
export async function loadExistingFile(context: ApplicationStore, file: string, name?: string, id?: string): Promise<AppCommand> {
    // Deserialize file
    const json = context.fileSerializer.deserialize(file);
    // Construct file
    const mappingFile = await context.fileAuthority.loadMappingFile(json, id);
    // Return command
    return new LoadFile(context, mappingFile, name);
}

export async function importFile(context: ApplicationStore, file: string, name?: string, id?: string): Promise<AppCommand> {
    // Deserialize file
    const json = context.fileSerializer.deserialize(file);
    // Construct file
    const mappingFile = await context.fileAuthority.importMappingFile(context.activeEditor, json, id);
    // Return command
    return new LoadFile(context, mappingFile, name);
}

/**
 * Loads a mapping file from the file system, into the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function loadFileFromFileSystem(context: ApplicationStore): Promise<AppCommand> {
    const { filename, contents } = await Browser.openTextFileDialog();
    return loadExistingFile(context, contents as string, filename);
}

/**
 * Imports a mapping file from the file system and merges it with the currently opened file, into the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function importFileFromFileSystem(context: ApplicationStore): Promise<AppCommand> {
    const { filename, contents } = await Browser.openTextFileDialog();
    return importFile(context, contents as string, filename);
}

/**
 * Loads a mapping file from a remote url, into the application.
 * @param context
 *  The application's context.
 * @param url
 *  The remote url.
 * @returns
 *  A command that represents the action.
 */
export async function loadFileFromUrl(context: ApplicationStore, url: string): Promise<AppCommand> {
    return loadExistingFile(context, await (await fetch(url)).text());
}

/**
 * Saves a mapping file to the user's file system.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export function saveActiveFileToDevice(context: ApplicationStore): AppCommand {
    return new SaveMappingFileToDevice(context, context.activeEditor as MappingFileEditor);
}

/**
 * Clears the application's file recovery bank.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export function clearFileRecoveryBank(context: ApplicationStore): AppCommand {
    return new ClearFileRecoveryBank(context)
}
