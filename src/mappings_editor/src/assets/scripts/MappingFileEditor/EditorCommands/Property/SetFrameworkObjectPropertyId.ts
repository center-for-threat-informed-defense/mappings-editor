import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
import type { FrameworkObjectProperty } from "@/assets/scripts/MappingFile";

export class SetFrameworkObjectPropertyId extends EditorCommand {

    /**
     * The property's previous object id.
     */
    public readonly prevObjectId: string | null;

    /**
     * The property's previous object text.
     */
    public readonly prevObjectText: string | null | undefined;

    /**
     * The property's next object id.
     */
    public readonly nextObjectId: string | null;

    /**
     * The property's next object text.
     */
    public readonly nextObjectText: string | null | undefined;

    /**
     * The property.
     */
    public readonly prop: FrameworkObjectProperty;
    

    /**
     * Sets the object id of a {@link FrameworkObjectProperty}.
     * @param prop
     *  The {@link FrameworkObjectProperty}.
     * @param objectId
     *  The {@link FrameworkObjectProperty}'s new object id.
     */
    constructor(prop: FrameworkObjectProperty, objectId: string | null);

    /**
     * Forcibly sets the object id and text of a
     * {@link FrameworkObjectProperty}.
     * @param prop
     *  The {@link FrameworkObjectProperty}.
     * @param objectId
     *  The {@link FrameworkObjectProperty}'s new object id.
     * @param objectText
     *  The {@link FrameworkObjectProperty}'s new object text.
     */
    constructor(prop: FrameworkObjectProperty, objectId: string, objectText: string | null);
    constructor(prop: FrameworkObjectProperty, objectId: string | null, objectText?: string | null){
        super();
        this.prop = prop;
        // Configure next value
        this.nextObjectId = objectId;
        this.nextObjectText = objectText;
        // Configure prev value
        if(this.prop.isObjectValueCached()) {
            this.prevObjectId = prop.objectId;
            this.prevObjectText = prop.objectText;
        } else {
            this.prevObjectId = prop.objectId;
        }
    }
    

    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    execute(issueDirective: DirectiveIssuer = () => {}): void {
        if(this.nextObjectId && this.nextObjectText !== undefined) {
            this.prop.setObjectValue(this.nextObjectId, this.nextObjectText);
        } else {
            this.prop.objectId = this.nextObjectId;
        }
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    undo(issueDirective: DirectiveIssuer = () => {}): void {
        if(this.prevObjectId && this.prevObjectText !== undefined) {
            this.prop.setObjectValue(this.prevObjectId, this.prevObjectText);
        } else {
            this.prop.objectId = this.prevObjectId;
        }
        issueDirective(EditorDirective.Autosave);
    }

}
