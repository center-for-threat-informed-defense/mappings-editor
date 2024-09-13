import { EditorCommand } from "..";
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
     */
    public async execute(): Promise<void> {
        this.prop.isTargeted = false;
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}
