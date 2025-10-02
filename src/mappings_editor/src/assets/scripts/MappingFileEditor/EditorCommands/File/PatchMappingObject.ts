import type { MappingObject } from "@/assets/scripts/MappingFile/MappingObject";
import { EditorCommand } from "../EditorCommand";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import { EditorDirective } from "../EditorDirective";

export class PatchMappingObject extends EditorCommand {

    /**
     * The mapping objects to insert.
     */
    public readonly object: MappingObject;

    /**
     * The mapping object's previous source framework.
     */
    public readonly prevSrcFramework: string;

    /**
     * The mapping object's previous source version.
     */
    public readonly prevSrcVersion: string;

    /**
     * The mapping object's previous target framework.
     */
    public readonly prevTarFramework: string;

    /**
     * The mapping object's previous target version.
     */
    public readonly prevTarVersion: string;


    /**
     * Patches a {@link MappingObject}'s source and target framework
     * so that it aligns with this file.
     * @param object
     * The mapping object to patch.
     */
    constructor(object: MappingObject) {
        super();
        if (object.file === null) {
            throw new Error("mapping must belong to a file.")
        }
        const src = object.sourceObject;
        const trg = object.targetObject;
        this.object = object;
        this.prevSrcFramework = src.objectFramework;
        this.prevSrcVersion = src.objectVersion;
        this.prevTarFramework = trg.objectFramework;
        this.prevTarVersion = trg.objectVersion;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     * A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => { }): Promise<void> {
        const obj = this.object;
        obj.sourceObject.setObjectValue(
            obj.sourceObject.objectId,
            obj.sourceObject.objectText,
            obj.file?.sourceFramework,
            obj.file?.sourceVersion
        );
        obj.targetObject.setObjectValue(
            obj.targetObject.objectId,
            obj.targetObject.objectText,
            obj.file?.targetFramework,
            obj.file?.targetVersion
        );
        issueDirective(EditorDirective.Autosave);
        issueDirective(EditorDirective.Reindex, obj.id);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     * A function that can issue one or more editor directives
     */
    public async undo(issueDirective: DirectiveIssuer = () => { }): Promise<void> {
        const obj = this.object;
        obj.sourceObject.setObjectValue(
            obj.sourceObject.objectId,
            obj.sourceObject.objectText,
            this.prevSrcFramework,
            this.prevSrcVersion
        );
        obj.targetObject.setObjectValue(
            obj.targetObject.objectId,
            obj.targetObject.objectText,
            this.prevTarFramework,
            this.prevTarVersion
        );
        issueDirective(EditorDirective.Autosave);
        issueDirective(EditorDirective.Reindex, obj.id);
    }
}
