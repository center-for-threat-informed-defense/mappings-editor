import { EditorCommand, EditorDirectives } from "..";
import type { DynamicFrameworkObjectProperty } from "@/assets/scripts/MappingFile";

export class EnterDynamicFrameworkObjectProperty extends EditorCommand {

    /**
     * The property to enter.
     */
    public readonly prop: DynamicFrameworkObjectProperty;
    

    /**
     * Enters a {@link DynamicFrameworkObjectProperty}.
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
        this.prop.isTargeted = true;
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
