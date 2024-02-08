import { DeleteMappingObject } from "./DeleteMappingObject";
import { CreateMappingObject } from "./CreateMappingObject";
import { InsertMappingObject } from "./InsertMappingObject";
import { InsertMappingObjects } from "./InsertMappingObjects";
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
 * Removes a {@link MappingObject} from its parent {@link MappingFile}.
 * @param object
 *  The mapping object to remove.
 * @returns
 *  A command that represents the action.
 */
export function deleteMappingObject(object: MappingObject): EditorCommand {
    return new DeleteMappingObject(object); 
}
