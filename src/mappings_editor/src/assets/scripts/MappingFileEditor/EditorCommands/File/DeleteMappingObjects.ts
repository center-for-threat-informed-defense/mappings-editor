import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
import type { MappingFile, MappingObject } from "@/assets/scripts/MappingFile";

export class DeleteMappingObjects extends EditorCommand {

    /**
     * The objects' mapping file.
     */
    public readonly file: MappingFile | null;
    
    /**
     * The mapping object groups to delete.
     */
    public readonly groups: ReadonlyArray<{

        /**
         * The group's preceding object.
         */
        readonly location: string | undefined,
        
        /**
         * A group of contiguous mapping objects.
         */
        readonly objects: MappingObject[]
    
    }>;


    /**
     * Deletes multiple {@link MappingObject}s from their {@link MappingFile}.
     * @param object
     *  The mapping objects to delete.
     */
    constructor(objects: MappingObject[]) {
        super();
        // Compute file
        let file: MappingFile | null = null;
        for(const obj of objects) {
            if(obj.file === null) {
                throw new Error(`'${ obj.id }' doesn't belong to a file.`);
            }
            if(file !== null && obj.file.id !== file.id) {
                throw new Error(`Objects must originate from the same file.`);
            }
            file = obj.file;
        }
        // Compute groups
        const groups = [];
        if(file !== null) {
            const ids = new Set(objects.map(o => o.id));
            const fileObjects = [...file.mappingObjects.values()];
            let group = [];
            let location = undefined;
            let inCluster = false;
            for(let i = 0; i < fileObjects.length; i++) {
                const fileObject = fileObjects[i];
                if(!inCluster && ids.has(fileObject.id)) {
                    inCluster = true;
                    group = [];
                    if(0 < i) {
                        location = fileObjects[i - 1].id;
                    }
                }
                if(inCluster) {
                    if(ids.has(fileObject.id)) {
                        group.push(fileObject);
                    } else {
                        inCluster = false;
                        groups.push({ location, objects: group })
                    }
                }
            }
            if(inCluster) {
                inCluster = false;
                groups.push({ location, objects: group });
            }
        }
        this.file = file;
        this.groups = groups;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer = () => {}): void {
        if(this.file === null) {
            return;
        }
        // Remove mapping objects
        for(const group of this.groups) {
            if(group.objects.length === 1) {
                this.file.removeMappingObject(group.objects[0]);
            } else {
                this.file.removeMappingObjects(group.objects);
            }
            for(const obj of group.objects) {
                issueDirective(EditorDirective.Reindex, obj.id);
            }
        }
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer = () => {}): void {
        if(this.file === null) {
            return;
        }
        // Insert mapping objects
        for(const group of this.groups) {
            if(group.objects.length === 1) {
                this.file.insertMappingObjectAfter(group.objects[0], group.location);
            } else {
                this.file.insertMappingObjectsAfter(group.objects, group.location);
            }
            for(const obj of group.objects) {
                issueDirective(EditorDirective.Reindex, obj.id);
            }
        }
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

}
