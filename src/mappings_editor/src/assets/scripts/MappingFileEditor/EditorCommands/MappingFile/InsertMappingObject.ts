import { EditorCommand, EditorDirectives } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";

export class InsertMappingObject extends EditorCommand {

    /**
     * The mapping file.
     */
    public readonly file: MappingFile;
    
    /**
     * The mapping object to insert.
     */
    public readonly object: MappingObject;


    /**
     * Inserts a {@link MappingObject} into a {@link MappingFile}.
     * @param file
     *  The mapping file to operate on.
     * @param object
     *  The mapping object to insert.
     */
    constructor(file: MappingFile, object: MappingObject) {
        super();
        this.file = file;
        this.object = object;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.file.insertMappingObjectAfter(this.object);
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        this.file.removeMappingObject(this.object);
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

}
