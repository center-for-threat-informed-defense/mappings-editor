import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
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
     * Deletes a {@link MappingObject} from its {@link MappingFile}.
     * @remarks
     *  Prefer {@link DeleteMappingObjects} when deleting multiple objects.
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
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        // Remove mapping object
        this.file.removeMappingObject(this.object.id);
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
        issueDirective(EditorDirective.Reindex, this.object.id);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        // Insert mapping object
        this.file.insertMappingObjectAfter(this.object, this.location);
        issueDirective(EditorDirective.Autosave);
        issueDirective(EditorDirective.Reindex, this.object.id);
    }

}
