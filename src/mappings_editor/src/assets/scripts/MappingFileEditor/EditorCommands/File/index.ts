import { CreateMappingObject } from "./CreateMappingObject";
import { InsertMappingObject } from "./InsertMappingObject";
import { DeleteMappingObject } from "./DeleteMappingObject";
import { InsertMappingObjects } from "./InsertMappingObjects";
import { DeleteMappingObjects } from "./DeleteMappingObjects";
import type { EditorCommand } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";

/**
 * Creates a new {@link MappingObject} in a {@link MappingFile}.
 * @param file
 *  The mapping file to operate on.
 * @returns
 *  A command that represents the action.
 */
export function createMappingObject(file: MappingFile): EditorCommand {
    return new CreateMappingObject(file); 
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
