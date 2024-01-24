import { EditorCommand, EditorDirectives } from "..";
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
     * @returns
     *  The command's directives.
     */
    execute(): EditorDirectives {
        this.prop.objectText = this.nextObjectText;
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    undo(): EditorDirectives {
        this.prop.objectText = this.prevObjectText;
        return EditorDirectives.Record | EditorDirectives.Autosave;
    }

}
