import type { StringProperty } from "@/assets/scripts/MappingFile";
import { EditorCommand, EditorDirectives } from "..";

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
     * @returns
     *  The command's directives.
     */
    execute(): EditorDirectives {
        this.prop.value = this.nextValue;
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    undo(): EditorDirectives {
        this.prop.value = this.prevValue;
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

}
