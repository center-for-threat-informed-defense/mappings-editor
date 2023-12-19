export * from "./ApplicationSettings";
export * from "./FileManagement";
export * from "./MappingFileEditor";
export * from "./ViewManagement";
export * from "./AppCommand";
export * from "./Command";

import { NullCommand } from "./NullCommand";

/**
 * Does nothing.
 * @returns
 *  A command that represents the action.
 */
export function doNothing() {
    return new NullCommand();
}
