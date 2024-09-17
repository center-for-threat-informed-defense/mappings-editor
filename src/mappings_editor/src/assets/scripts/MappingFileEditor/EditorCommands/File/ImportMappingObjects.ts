import { Reactivity } from "../..";
import { DeleteMappingObjects } from "./DeleteMappingObjects";
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
     * The delete command used to undo the import.
     */
    private _deleteCommand: DeleteMappingObjects | null;


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
        this._deleteCommand = null;
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
     * Redoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async redo(issueDirective?: DirectiveIssuer): Promise<void> {
        await this._deleteCommand?.undo(issueDirective);
        this._deleteCommand = null;
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this._deleteCommand = new DeleteMappingObjects(
            this.objects.map(o => this.file.mappingObjects.get(o.objectId)!)
        )
        await this._deleteCommand.execute(issueDirective);
    }

}

/**
 * Identified {@link MappingObjectParameters} type definition.
 */
export type IdentifiedMappingObjectParameters = Omit<MappingObjectParameters, "objectId"> & {
    objectId: string
}
