import { ImportFile } from './ImportFile';
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

/**
 * Imports a mapping file from the file system and merges it with the currently opened file, into the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function importFileFromFileSystem(context: ApplicationStore): Promise<AppCommand> {
    const { contents } = await Browser.openTextFileDialog();
    // Deserialize file
    const json = context.fileSerializer.deserialize(contents as string);
    // throw error if imported file's source framework does not match the current file's source framework
    const activeEditorFile = context.activeEditor.file;
    if (activeEditorFile.sourceFramework !== json.source_framework) {
        throw new Error(`The imported file's mapping framework must be the same as the active file's mapping framework.`)
    }
    // throw error if imported file's target framework does not match the current file's target framework
    if (activeEditorFile.targetFramework !== json.target_framework){
        throw new Error(`The imported file's target framework must be the same as the active file's target framework.`)
    }
    // if versions do not match, explicitly set the imported file's mapping objects to the version
    if (activeEditorFile.sourceVersion !== json.source_version) {
        json.mapping_objects.forEach(mappingObject => {
            mappingObject.source_version = json.source_version
        })
    }
    if (activeEditorFile.targetVersion !== json.target_version) {
        json.mapping_objects.forEach(mappingObject => {
            mappingObject.target_version = json.target_version
        })
    }
     // Return command
    return new ImportFile(context, json);
}