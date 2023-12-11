import * as EditorCommands from "../../EditorCommands";
import { BreakoutSectionView } from ".";
import type { EditorCommand } from "../../EditorCommands";
import type { MappingObject } from "@/assets/scripts/MappingFile";
import type { MappingFileView } from "..";

export class MappingStatusSectionView extends BreakoutSectionView {
    
    /**
     * Creates a new {@link MappingStatusSectionView}.
     * @param file
     *  The mapping file view the item belongs to.
     * @param name
     *  The section's name
     * @param value
     *  The section's value.
     */
    constructor(file: MappingFileView, name: string, value: string | null) {
        super(file, name, value);
    }

    /**
     * Returns an {@link EditorCommand} that applies the section view's value
     * to the specified {@link MappingObject}.
     * @param obj
     *  The {@link MappingObject}.
     * @returns
     *  The {@link EditorCommand}.
     */
    public applySectionValue(obj: MappingObject): EditorCommand {
        return EditorCommands.setListItemProperty(obj.mappingStatus, this.value);
    }

}
