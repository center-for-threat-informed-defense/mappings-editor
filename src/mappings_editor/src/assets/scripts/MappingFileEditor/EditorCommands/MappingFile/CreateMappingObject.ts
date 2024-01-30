import { EditorCommand, EditorDirectives } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";

export class CreateMappingObject extends EditorCommand {

    /**
     * The mapping file.
     */
    public readonly file: MappingFile;
    
    /**
     * The new mapping object to add.
     */
    public readonly object: MappingObject;


    /**
     * Creates a new {@link MappingObject} in a {@link MappingFile}.
     * @param file
     *  The mapping file to operate on.
     */
    constructor(file: MappingFile) {
        super();
        this.file = file;
        this.object = file.createMappingObject();
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
