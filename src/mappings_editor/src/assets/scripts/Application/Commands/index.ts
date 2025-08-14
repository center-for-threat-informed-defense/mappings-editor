import { NullCommand } from "./index.commands";

export * from "./index.commands";
export * from "./ApplicationSettings";
export * from "./FileManagement";
export * from "./MappingFileEditor";
export * from "./ViewManagement";
export * from "./Command";


/**
 * Does nothing.
 * @returns
 *  A command that represents the action.
 */
export function doNothing() {
    return new NullCommand();
}
