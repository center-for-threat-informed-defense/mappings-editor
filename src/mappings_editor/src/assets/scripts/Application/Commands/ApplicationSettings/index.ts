import { FrameworkSourceFile, type Framework } from "@/assets/scripts/MappingFileAuthority";
import { Browser } from "@/assets/scripts/Utilities";
import { AppCommand } from "../AppCommand";
import { LoadSettings } from "./LoadSettings";
import { RegisterFramework } from "./RegisterFramework";
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
export function loadSettings(context: ApplicationStore, settings: AppSettings): AppCommand {
   return new LoadSettings(context, settings);
}

/**
 * Registers an existing framework with the application.
 * @param context
 *  The application's context.
 * @param file
 *  The framework file.
 * @returns
 *  A command that represents the action.
 */
export async function registerExistingFramework(context: ApplicationStore, file: string): Promise<AppCommand> {
   // Deserialize framework file
   const json = JSON.parse(file) as Framework;
   // Load framework into file source
   const source = new FrameworkSourceFile(json);
   // Return command
   return new RegisterFramework(context, source);
}

/**
 * Registers an existing framework, from the file system, with the application.
 * @param context
 *  The application's context.
 * @returns
 *  A command that represents the action.
 */
export async function registerFrameworkFromFileSystem(context: ApplicationStore): Promise<AppCommand> {
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
export async function registerFrameworkFromUrl(context: ApplicationStore, url: string): Promise<AppCommand> {
   return registerExistingFramework(context, await (await fetch(url)).text());
}
