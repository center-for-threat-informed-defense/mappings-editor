import { EditorCommand, EditorDirectives } from "..";
import type { DynamicFrameworkObjectProperty } from "@/assets/scripts/MappingFile";

export class ExitDynamicFrameworkObjectProperty extends EditorCommand {

    /**
     * The property to exit.
     */
    public readonly prop: DynamicFrameworkObjectProperty;
    

    /**
     * Exits a {@link DynamicFrameworkObjectProperty}.
     * @param prop
     *  The {@link DynamicFrameworkObjectProperty}.
     */
    constructor(prop: DynamicFrameworkObjectProperty){
        super();
        this.prop = prop;
    }
    

    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    execute(): EditorDirectives {
        this.prop.isTargeted = false;
        return EditorDirectives.None;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    undo(): EditorDirectives {
        return EditorDirectives.None;
    }

}
