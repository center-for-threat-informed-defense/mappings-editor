import Configuration from "@/assets/configuration/app.config";
import { Browser } from "@/assets/scripts/Utilities/Browser";
import { LoadFile } from "./LoadFile";
import { AppCommand } from "../AppCommand";
import { SaveFileToDevice } from "./SaveFileToDevice";
import type { MappingFile } from "@/assets/scripts/MappingsFile";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileExport } from "@/assets/scripts/MappingsFileAuthority";

/**
 * Loads an empty mapping file into the application.
 * @param context
 *  The application's context.
 * @param settings
 *  The mapping file's settings.
 * @returns
 *  A command that represents the action.
 */
export async function loadNewPageFile(context: ApplicationStore, settings: MappingFileExport): Promise<AppCommand> {
    // Create file
    const mappingFile = await context.fileAuthority.createMappingFile(settings);
    // Return command
    return new LoadFile(context, mappingFile);
}

/**
 * Loads a mapping file export into the application.
 * @param context
 *  The application's context.
 * @param file
 *  The file export.
 * @returns
 *  A command that represents the action.
 */
export async function loadPageFromFile(context: ApplicationStore, file: string): Promise<AppCommand> {
    // Deserialize file
    const json = context.fileSerializer.deserialize(file);
    // Construct file
    const mappingFile = await context.fileAuthority.loadMappingFile(json);
    // Return command
    return new LoadFile(context, mappingFile);
}

/**
 * Loads a mapping file from the file system, into the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function loadPageFromFileSystem(context: ApplicationStore): Promise<AppCommand> {
    return loadPageFromFile(context, (await Browser.openTextFileDialog()).contents as string);
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
export async function loadPageFromUrl(context: ApplicationStore, url: string): Promise<AppCommand> {
    return loadPageFromFile(context, await (await fetch(url)).text());
}

/**
 * Saves a mapping file to the user's file system.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export function saveActiveFileToDevice(context: ApplicationStore): AppCommand {
    // Deconstruct file
    const file = context.fileAuthority.exportMappingsFile(context.activeEditor.file as MappingFile);
    // Serialize file
    const json = context.fileSerializer.serialize(file);
    // Return command
    return new SaveFileToDevice(context.activeEditor.name, Configuration.file_type_extension, json);
}
