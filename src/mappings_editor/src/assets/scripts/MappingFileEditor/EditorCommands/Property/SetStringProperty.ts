import type { StringProperty } from "@/assets/scripts/MappingFile";
import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";

export class SetStringProperty extends EditorCommand {

    /**
     * The property's previous value.
     */
    public readonly prevValue: string | null;

    /**
     * The property's next value.
     */
    public readonly nextValue: string | null;

    /**
     * The property.
     */
    public readonly prop: StringProperty;
    

    /**
     * Sets the value of a {@link StringProperty}.
     * @param prop
     *  The {@link StringProperty}.
     * @param value
     *  The {@link StringProperty}'s new value.
     */
    constructor(prop: StringProperty, value: string | null){
        super();
        this.prop = prop;
        this.prevValue = prop.value;
        this.nextValue = value;
    }
    

    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    execute(issueDirective: DirectiveIssuer = () => {}): void {
        this.prop.value = this.nextValue;
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    undo(issueDirective: DirectiveIssuer = () => {}): void {
        this.prop.value = this.prevValue;
        issueDirective(EditorDirective.Autosave);
    }

}
