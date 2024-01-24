import { EditorCommand, EditorDirectives } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";

export class DeleteMappingObject extends EditorCommand {

    /**
     * The object's mapping file.
     */
    public readonly file: MappingFile;
    
    /**
     * The deleted mapping object.
     */
    public readonly object: MappingObject;

    /**
     * The mapping object's preceding object.
     */
    public readonly location: string | undefined;


    /**
     * Deletes a {@link MappingObject} from its parent {@link MappingFile}.
     * @remarks
     *  When deleting multiple mapping objects in a single group command,
     *  ensure objects are deleted in order from last to first.
     * @param object
     *  The mapping object to delete.
     */
    constructor(object: MappingObject) {
        if(object.file === null) {
            throw new Error(
                `'${ object.id }' doesn't belong to a file.`
            );
        }
        super();
        this.file = object.file;
        this.object = object;
        this.location = this.file.getMappingObjectBefore(object)?.id;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        // Remove mapping object
        this.file.removeMappingObject(this.object.id);
        return EditorDirectives.Record
             | EditorDirectives.Autosave;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        // Insert mapping object
        this.file.insertMappingObjectAfter(this.object, this.location);
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

}
