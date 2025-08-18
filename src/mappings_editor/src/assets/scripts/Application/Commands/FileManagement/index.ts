import Configuration from "@/assets/configuration/app.config";
import { Browser } from "@/assets/scripts/Utilities/Browser";
import { ExportType } from "..";
import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFileImport } from "@/assets/scripts/MappingFileAuthority";
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import {
    ClearFileRecoveryBank,
    ImportFile,
    LoadFile,
    SaveFileToDevice,
    SaveMappingFileToDevice
} from "./index.commands";

export * from "./ExportType";

///////////////////////////////////////////////////////////////////////////////
//  1. Open / Import Files  ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Loads an empty mapping file into the application.
 * @param context
 *  The application's context.
 * @param settings
 *  The mapping file's settings.
 * @returns
 *  A command that represents the action.
 */
export async function loadNewFile(context: ApplicationStore, settings: MappingFileImport): Promise<AppCommand> {
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
 * Imports a mapping file export into the active editor.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function importExistingFile(context: ApplicationStore, file: string): Promise<AppCommand> {
    // Deserialize file
    const json = context.fileSerializer.deserialize(file);
    // Return command
    return new ImportFile(context, json);
}

/**
 * Loads a mapping file, from the file system, into the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function loadFileFromFileSystem(context: ApplicationStore): Promise<AppCommand> {
    const { filename, contents } = await Browser.openTextFileDialog([Configuration.file_type_extension], false);
    return loadExistingFile(context, contents as string, filename);
}

/**
 * Imports mapping files, from the file system, into the active editor.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function importFileFromFileSystem(context: ApplicationStore): Promise<AppCommand> {
    const files = await Browser.openTextFileDialog([Configuration.file_type_extension], true);
    // Deserialize files
    const json = new Array<MappingFileImport>(files.length);
    for(let i = 0; i < json.length; i++) {
        json[i] = context.fileSerializer.deserialize(files[i].contents as string);
    }
    // Merge files
    const file = context.fileAuthority.mergeMappingFileImports(json);
    // Return command
    return new ImportFile(context, file);
}

/**
 * Loads a mapping file, from a remote url, into the application.
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
 * Imports a mapping file, from a remote url, into the active editor.
 * @param context
 *  The application's context.
 * @param url
 *  The remote url.
 * @returns
 *  A command that represents the action.
 */
export async function importFileFromUrl(context: ApplicationStore, url: string): Promise<AppCommand> {
    return importExistingFile(context, await (await fetch(url)).text());
}


///////////////////////////////////////////////////////////////////////////////
//  2. Save / Export Files  ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


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
 * Exports the mapping file to the users's file system.
 * @param context
 *  The application's context.
 * @param type
 *  The export type.
 * @returns
 *  A command that represents the action.
 */
export async function exportActiveFileToDevice(context: ApplicationStore, type: ExportType): Promise<AppCommand> {
    const editor = context.activeEditor as MappingFileEditor;
    // Deconstruct file
    const file = context.fileAuthority.exportMappingFile(editor.file);
    // Serialize file
    const options = { type: "text/plain" };
    let name = editor.name;
    let blob: Blob;
    let ext: string;
    switch(type) {
        case ExportType.CSV:
            blob = new Blob([context.fileSerializer.toCsvFile(file)], options);
            ext = "csv"
            break;
        case ExportType.YAML:
            blob = new Blob([context.fileSerializer.toYamlFile(file)], options);
            ext = "yaml"
            break;
        case ExportType.XLSX:
            blob = await context.fileSerializer.toExcelFile(file, editor.name || "Mappings");
            ext = "xlsx"
            break;
        case ExportType.NAVIGATOR:
            blob = new Blob([context.fileSerializer.toNavigatorLayer(file)], options);
            name = `${ name }_navigator_layer`
            ext = "json";
            break;
    }
    // Return command
    return new SaveFileToDevice(name, ext, blob);
}


///////////////////////////////////////////////////////////////////////////////
//  3. File Recovery Bank  ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


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
