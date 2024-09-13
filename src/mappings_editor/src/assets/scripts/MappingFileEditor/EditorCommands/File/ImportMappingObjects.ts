import { Reactivity } from "../..";
import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
import type { MappingFile, MappingObject, MappingObjectParameters } from "@/assets/scripts/MappingFile";

export class ImportMappingObjects extends EditorCommand {

    /**
     * The mapping file.
     */
    public readonly file: MappingFile;

    /**
     * The new mapping objects to import.
     */
    public readonly objects: IdentifiedMappingObjectParameters[];


    /**
     * Imports new {@link MappingObject}s into a {@link MappingFile}.
     * @param file
     *  The mapping file to operate on.
     * @param objects
     *  The mapping objects' parameters.
     */
    constructor(file: MappingFile, objects: IdentifiedMappingObjectParameters[]) {
        super();
        this.file = file;
        this.objects = objects;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        // Create objects
        const file = Reactivity.toRaw(this.file);
        const objs = new Array<MappingObject>(this.objects.length);
        for(let i = 0; i < this.objects.length; i++) {
            objs[i] = file.createMappingObject(this.objects[i]);
        }
        // Insert objects
        this.file.insertMappingObjectsAfter(objs);
        // Issue directives
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
        for(const obj of this.objects) {
            issueDirective(EditorDirective.Reindex, obj.objectId);
        }
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        // Remove objects
        this.file.removeMappingObjects(this.objects.map(o => o.objectId));
        // Issue directives
        issueDirective(EditorDirective.Autosave);
        for(const obj of this.objects) {
            issueDirective(EditorDirective.Reindex, obj.objectId);
        }
    }

}

/**
 * Identified {@link MappingObjectParameters} type definition.
 */
export type IdentifiedMappingObjectParameters = Omit<MappingObjectParameters, "objectId"> & {
    objectId: string
}
