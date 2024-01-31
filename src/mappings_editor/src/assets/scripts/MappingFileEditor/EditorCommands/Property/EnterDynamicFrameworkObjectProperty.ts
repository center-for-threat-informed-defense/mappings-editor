import { EditorCommand } from "..";
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
     */
    execute(): void {
        this.prop.isTargeted = true;
    }

    /**
     * Undoes the editor command.
     */
    undo(): void {}

}
