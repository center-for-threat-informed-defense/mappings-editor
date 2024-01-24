import { EditorCommand, EditorDirectives } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";

export class MoveMappingObjectsAfter extends EditorCommand {

    /**
     * The mapping file.
     */
    public readonly file: MappingFile;
    
    /**
     * The id of the object to move.
     */
    public readonly object: MappingObject;

    /**
     * The id of the previous location.
     */
    public readonly prevLocation: string | undefined;

    /**
     * The id of the next location.
     */
    public readonly nextLocation: string | undefined;


    /**
     * Moves one {@link MappingObject} after another {@link MappingObject}.
     * @remarks
     *  When moving multiple mapping objects in a single group command,
     *  ensure objects are moved in order from first to last.
     * @param object
     *  The object to move.
     * @param location
     *  The destination object.
     */
    constructor(object: MappingObject, destination: MappingObject | undefined) {
        super();
        if(!object.file) {
            throw new Error(`'${ object.id }' is not associated with a file.`);
        }
        this.file = object.file;
        this.object = object;
        this.prevLocation = this.file.getMappingObjectBefore(object)?.id;
        this.nextLocation = destination?.id;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.file.removeMappingObject(this.object);
        this.file.insertMappingObjectAfter(this.object, this.nextLocation);
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        this.file.removeMappingObject(this.object);
        this.file.insertMappingObjectAfter(this.object, this.prevLocation);
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

}
