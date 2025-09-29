import { CreateMappingObject } from "./CreateMappingObject";
import { InsertMappingObject } from "./InsertMappingObject";
import { DeleteMappingObject } from "./DeleteMappingObject";
import { ImportMappingObjects } from "./ImportMappingObjects";
import { InsertMappingObjects } from "./InsertMappingObjects";
import { DeleteMappingObjects } from "./DeleteMappingObjects";
import type { EditorCommand } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";
import type { IdentifiedMappingObjectParameters } from "./ImportMappingObjects";
import { PatchMappingObject } from "./PatchMappingObject";
export type { IdentifiedMappingObjectParameters } from "./ImportMappingObjects";

/**
 * Creates a new {@link MappingObject} in a {@link MappingFile}.
 * @remarks
 *  Note the difference between `Create` and `Import`. `Create` initializes the
 *  Mapping Object upon creation of the command and `Import` initializes the
 *  Mapping Object upon execution of the command.
 * @param file
 *  The mapping file to operate on.
 * @returns
 *  A command that represents the action.
 */
export function createMappingObject(file: MappingFile): EditorCommand {
    return new CreateMappingObject(file);
}

/**
 * Imports new {@link MappingObject}s into a {@link MappingFile}.
 * @remarks
 *  Note the difference between `Create` and `Import`. `Create` initializes the
 *  Mapping Object upon creation of the command and `Import` initializes the
 *  Mapping Object upon execution of the command.
 * @param file
 *  The mapping file to operate on.
 * @param objects
 *  The mapping objects' parameters.
 * @returns
 *  A command that represents the action.
 */
export function importMappingObjects(file: MappingFile, objects: IdentifiedMappingObjectParameters[]): EditorCommand {
    return new ImportMappingObjects(file, objects);
}

/**
 * Inserts a {@link MappingObject} into a {@link MappingFile}.
 * @param file
 *  The mapping file to operate on.
 * @param obj
 *  The mapping object to insert.
 * @returns
 *  A command that represents the action.
 */
export function insertMappingObject(file: MappingFile, obj: MappingObject): EditorCommand {
    return new InsertMappingObject(file, obj);
}

/**
 * Inserts multiple {@link MappingObject}s into a {@link MappingFile}.
 * @param file
 *  The mapping file to operate on.
 * @param objects
 *  The mapping objects to insert.
 * @returns
 *  A command that represents the action.
 */
export function insertMappingObjects(file: MappingFile, objs: MappingObject[]): EditorCommand {
    return new InsertMappingObjects(file, objs);
}

/**
 * Deletes a {@link MappingObject} from its {@link MappingFile}.
 * @remarks
 *  Prefer {@link deleteMappingObjects} when deleting multiple objects.
 * @param object
 *  The mapping object to delete.
 * @returns
 *  A command that represents the action.
 */
export function deleteMappingObject(object: MappingObject): EditorCommand {
    return new DeleteMappingObject(object);
}

/**
 * Deletes multiple {@link MappingObject}s from their {@link MappingFile}.
 * @param object
 *  The mapping objects to delete.
 * @returns
 *  A command that represents the action.
 */
export function deleteMappingObjects(objects: MappingObject[]): EditorCommand {
    return new DeleteMappingObjects(objects);
}

/**
 * Patches {@link MappingObject}
 * @param object
 * @returns
 */
export function patchMappingObject(object: MappingObject): EditorCommand {
    return new PatchMappingObject(object);
}
