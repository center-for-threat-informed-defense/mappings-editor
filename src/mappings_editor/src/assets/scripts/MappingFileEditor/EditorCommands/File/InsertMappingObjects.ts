import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";

export class InsertMappingObjects extends EditorCommand {

    /**
     * The mapping file.
     */
    public readonly file: MappingFile;
    
    /**
     * The mapping objects to insert.
     */
    public readonly objects: MappingObject[];


    /**
     * Inserts multiple {@link MappingObject}s into a {@link MappingFile}.
     * @param file
     *  The mapping file to operate on.
     * @param objects
     *  The mapping objects to insert.
     */
    constructor(file: MappingFile, objects: MappingObject[]) {
        super();
        this.file = file;
        this.objects = objects;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.file.insertMappingObjectsAfter(this.objects);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
        for(const obj of this.objects) {
            issueDirective(EditorDirective.Reindex, obj.id);
        }
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.file.removeMappingObjects(this.objects);
        issueDirective(EditorDirective.Autosave);
        for(const obj of this.objects) {
            issueDirective(EditorDirective.Reindex, obj.id);
        }
    }

}
