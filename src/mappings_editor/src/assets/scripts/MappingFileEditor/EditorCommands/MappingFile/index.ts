import { DeleteMappingObject } from "../MappingFile/DeleteMappingObject";
import { CreateMappingObject } from "./CreateMappingObject";
import type { EditorCommand } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";
import { InsertMappingObject } from "./InsertMappingObject";

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
 * Removes a {@link MappingObject} from its parent {@link MappingFile}.
 * @param object
 *  The mapping object to remove.
 * @returns
 *  A command that represents the action.
 */
export function deleteMappingObject(object: MappingObject): EditorCommand {
    return new DeleteMappingObject(object); 
}
