import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";
import type { FrameworkObjectProperty } from "@/assets/scripts/MappingFile";

export class SetFrameworkObjectPropertyText extends EditorCommand {

    /**
     * The property's previous object text.
     */
    public readonly prevObjectText: string | null;

    /**
     * The property's next object text.
     */
    public readonly nextObjectText: string | null;

    /**
     * The property.
     */
    public readonly prop: FrameworkObjectProperty;


    /**
     * Sets the object text of a {@link FrameworkObjectProperty}.
     * @param prop
     *  The {@link FrameworkObjectProperty}.
     * @param objectId
     *  The {@link FrameworkObjectProperty}'s new object text.
     */
    constructor(prop: FrameworkObjectProperty, objectText: string | null){
        super();
        this.prop = prop;
        this.prevObjectText = prop.objectText;
        this.nextObjectText = objectText;
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.prop.objectText = this.nextObjectText;
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.prop.objectText = this.prevObjectText;
        issueDirective(EditorDirective.Autosave);
    }

}
