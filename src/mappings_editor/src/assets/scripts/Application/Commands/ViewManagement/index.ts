import type { ApplicationStore } from "@/stores/ApplicationStore";
import { AppCommand } from "../AppCommand";
import { OpenHyperlink } from "./OpenHyperlink"
import { SetAutoScroll } from "./SetAutoScroll";
import { SwitchToFullscreen } from "./SwitchToFullscreen";
import { ShowFileCreationScreen } from "./ShowFileCreationScreen";

/** Creates a command that opens the new mapping file form. */
export function showFileCreationScreen(context: ApplicationStore): AppCommand {
    return new ShowFileCreationScreen(context);
}

/**
 * Opens an external hyperlink.
 * @param url
 *  The hyperlink's url.
 * @returns
 *  A command that represents the action.
 */
export function openHyperlink(url: string): AppCommand {
    return new OpenHyperlink(url);
}

/**
 * Switches the application to fullscreen mode.
 * @returns
 *  A command that represents the action.
 */
export function switchToFullscreen(): AppCommand {
    return new SwitchToFullscreen();
}

/**
 * Toggles autoscroll (scrolls with selection when mappings move)
 * @param context
*  The application context.
* @param value
*  The new value to put for this parameter
 * @returns
 *  A command that represents the action.
 */
export function setAutoScroll(context: ApplicationStore, value: boolean): AppCommand {
    return new SetAutoScroll(context, value);
}

