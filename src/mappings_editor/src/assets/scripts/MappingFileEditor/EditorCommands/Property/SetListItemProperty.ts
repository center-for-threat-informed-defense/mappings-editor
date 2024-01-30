import type { ListItemProperty } from "@/assets/scripts/MappingFile";
import { EditorCommand, EditorDirective, type DirectiveIssuer } from "..";

export class SetListItemProperty extends EditorCommand {

    /**
     * The property's previous value or export value.
     */
    public readonly prevValue: string | null;

    /**
     * The property's previous export text.
     */
    public readonly prevExportText: string | undefined;

    /**
     * The property's next value or export value.
     */
    public readonly nextValue: string | null;

    /**
     * The property's next export text.
     */
    public readonly nextExportText: string | undefined;

    /**
     * The property.
     */
    public readonly prop: ListItemProperty;
    

    /**
     * Sets the value of a {@link ListItemProperty}.
     * @param prop
     *  The {@link ListItemProperty}.
     * @param value
     *  The {@link ListItemProperty}'s new value.
     */
    constructor(prop: ListItemProperty, value: string | null);

    /**
     * Forcibly sets the value of a {@link ListItemProperty}.
     * @param prop
     *  The {@link ListItemProperty}.
     * @param exportValue
     *  The {@link ListItemProperty}'s new export value.
     * @param exportText
     *  The {@link SetListItemProperty}'s new export text.
     */
    constructor(prop: ListItemProperty, exportValue: string, exportText: string);
    constructor(prop: ListItemProperty, param1: string | null, param2?: string){
        super();
        this.prop = prop;
        // Configure next value
        this.nextValue = param1;
        if(param2 !== undefined) {
            this.nextExportText = param2;
        } 
        // Configure prev value
        if(prop.isValueCached()) {
            this.prevValue = prop.exportValue;
            this.prevExportText = prop.exportText!;
        } else {
            this.prevValue = prop.value;
        }
    }
    

    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    execute(issueDirective: DirectiveIssuer): void {
        if(this.nextValue && this.nextExportText !== undefined) {
            this.prop.setValue(this.nextValue, this.nextExportText);
        } else {
            this.prop.value = this.nextValue;
        }
        issueDirective(EditorDirective.Record | EditorDirective.Autosave);
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    undo(issueDirective: DirectiveIssuer): void {
        if(this.prevValue && this.prevExportText !== undefined) {
            this.prop.setValue(this.prevValue, this.prevExportText);
        } else {
            this.prop.value = this.prevValue;
        }
        issueDirective(EditorDirective.Autosave);
    }

}
