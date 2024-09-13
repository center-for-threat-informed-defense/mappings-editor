import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
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
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.file.insertMappingObjectAfter(this.object);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
        issueDirective(EditorDirective.Reindex, this.object.id);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.file.removeMappingObject(this.object);
        issueDirective(EditorDirective.Autosave);
        issueDirective(EditorDirective.Reindex, this.object.id);
    }

}
