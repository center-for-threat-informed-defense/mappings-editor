import { Browser } from "@/assets/scripts/Utilities";
import { 
   LoadFrameworkFile,
   LoadSettings,
   UnloadStoredFrameworks
} from "./index.commands";
import type { Framework } from "@/assets/scripts/MappingFileAuthority";
import type { AppSettings } from "@/assets/scripts/Application";
import type { ApplicationStore } from "@/stores/ApplicationStore";


/**
 * Loads the application's settings.
 * @param context
 *  The application's context.
 * @param settings
 *  The application's settings.
 * @returns
 *  A command that represents the action.
 */
export function loadSettings(
   context: ApplicationStore, settings: AppSettings
): LoadSettings {
   return new LoadSettings(context, settings);
}

/**
 * Registers and saves a framework to the application's Framework Bank.
 * @param context
 *  The application's context.
 * @param file
 *  The framework file.
 * @returns
 *  A command that represents the action.
 */
export async function registerExistingFramework(
   context: ApplicationStore, file: string
): Promise<LoadFrameworkFile> {
   // Deserialize framework file
   const json = JSON.parse(file) as Framework;
   // Return command
   return new LoadFrameworkFile(context, json);
}

/**
 * Registers an existing framework, from the file system, with the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function registerFrameworkFromFileSystem(
   context: ApplicationStore
): Promise<LoadFrameworkFile> {
   const { contents } = await Browser.openTextFileDialog(["json"], false);
   return registerExistingFramework(context, contents as string);
}

/**
 * Registers an existing framework, from a remote url, with the application.
 * @param context
 *  The application's context.
 * @param url
 *  The remote url.
 * @returns
 *  A command that represents the action.
 */
export async function registerFrameworkFromUrl(
   context: ApplicationStore, url: string
): Promise<LoadFrameworkFile> {
   return registerExistingFramework(context, await (await fetch(url)).text());
}

/**
 * Deregisters and deletes all Frameworks stored in the application's
 * Framework Bank.
 * @param context
 *  The application context.
 * @returns
 *  A command that represents the action.
 */
export async function unloadStoredFrameworks(
   context: ApplicationStore
): Promise<UnloadStoredFrameworks> {
   return new UnloadStoredFrameworks(context);
}
