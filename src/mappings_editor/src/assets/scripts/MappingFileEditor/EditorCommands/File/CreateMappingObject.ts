import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
import type { MappingFile, MappingObject, MappingObjectParameters } from "@/assets/scripts/MappingFile";

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
    constructor(file: MappingFile);

    /**
     * Creates a new {@link MappingObject} in a {@link MappingFile}.
     * @param file
     *  The mapping file to operate on.
     * @param params
     *  The mapping object's parameters.
     */
    constructor(file: MappingFile, params?: MappingObjectParameters);
    constructor(file: MappingFile, params?: MappingObjectParameters) {
        super();
        this.file = file;
        this.object = file.createMappingObject(params);
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
