import { CreateMappingObject } from "./CreateMappingObject";
import { InsertMappingObject } from "./InsertMappingObject";
import { DeleteMappingObject } from "./DeleteMappingObject";
import { ImportMappingObjects } from "./ImportMappingObjects";
import { InsertMappingObjects } from "./InsertMappingObjects";
import { DeleteMappingObjects } from "./DeleteMappingObjects";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";
import type { IdentifiedMappingObjectParameters } from "./ImportMappingObjects";
import { MoveMappingObjectsAfter } from "./MoveMappingObjectsAfter";
import { ReindexMappingObjects } from "./ReindexMappingObjects";
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
export function createMappingObject(
    file: MappingFile
): CreateMappingObject {
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
export function importMappingObjects(
    file: MappingFile, objects: IdentifiedMappingObjectParameters[]
): ImportMappingObjects {
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
export function insertMappingObject(
    file: MappingFile, obj: MappingObject
): InsertMappingObject {
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
export function insertMappingObjects(
    file: MappingFile, objs: MappingObject[]
): InsertMappingObjects {    return new InsertMappingObjects(file, objs);
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
export function deleteMappingObject(
    object: MappingObject
): DeleteMappingObject {
    return new DeleteMappingObject(object);
}

/**
 * Deletes multiple {@link MappingObject}s from their {@link MappingFile}.
 * @param object
 *  The mapping objects to delete.
 * @returns
 *  A command that represents the action.
 */
export function deleteMappingObjects(
    objects: MappingObject[]
): DeleteMappingObjects {
    return new DeleteMappingObjects(objects);
}

/**
 * Moves one {@link MappingObject} after another {@link MappingObject}.
 * @remarks
 *  When moving multiple mapping objects in a single group command,
 *  ensure objects are moved in order from first to last.
 * @param object
 *  The object to move.
 * @param location
 *  The destination object.
 * @returns
 *  A command that represents the action.
 */
export function moveMappingObjectAfter(
    object: MappingObject, destination: MappingObject | undefined
): MoveMappingObjectsAfter {
    return new MoveMappingObjectsAfter(object, destination);
}

/**
 * Reindexes a set of mapping objects.
 * @remarks
 *  Ideally, a user of the MappingFileEditor library wouldn't have to
 *  explicity command the editor to reindex a mapping object when it
 *  changes. This operation should be accomplished implicitly when a
 *  mapping file is altered. In time, the existing libraries will be
 *  refactored to enable this behavior. This command may be deprecated in
 *  the future.
 * @param ids
 *  The mapping objects, specified by id.
 */
export function reindexMappingObjects(
    ids: string[] | string
): ReindexMappingObjects {
    return new ReindexMappingObjects(ids);
}
