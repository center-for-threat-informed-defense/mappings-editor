import { EditorCommand, EditorDirectives } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";

export class DeleteMappingObject extends EditorCommand {

    /**
     * The object's index in the mapping file.
     */
    public readonly index: number;

    /**
     * The object's mapping file.
     */
    public readonly file: MappingFile;
    
    /**
     * The removed mapping object.
     */
    public readonly object: MappingObject;


    /**
     * Removes a {@link MappingObject} from its parent {@link MappingFile}.
     * @param object
     *  The mapping object to remove.
     */
    constructor(object: MappingObject) {
        if(object.file === null) {
            throw new Error(
                `Mapping Object '${ object.id }' does not belong to a file.`
            );
        }
        super();
        this.file = object.file;
        this.object = object;
        this.index = this.file.getMappingObjectIndex(object);
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        // Remove mapping object
        this.file.removeMappingObject(this.object.id);
        // Cache object values
        this.object.sourceObject.cacheObjectValue();
        this.object.targetObject.cacheObjectValue();
        return EditorDirectives.Record | EditorDirectives.RebuildBreakouts;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        // Uncache object values
        this.object.sourceObject.tryUncacheObjectValue();
        this.object.targetObject.tryUncacheObjectValue();
        // Insert mapping object
        this.file.insertMappingObject(this.object, this.index);
        return EditorDirectives.RebuildBreakouts;
    }

}
