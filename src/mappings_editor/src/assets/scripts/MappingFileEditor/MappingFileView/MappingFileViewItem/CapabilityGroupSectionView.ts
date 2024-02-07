import * as EditorCommands from "../../EditorCommands";
import { BreakoutSectionView } from ".";
import type { EditorCommand } from "../../EditorCommands";
import type { MappingObject } from "@/assets/scripts/MappingFile";
import type { MappingFileView } from "..";

export class CapabilityGroupSectionView extends BreakoutSectionView {
    
    /**
     * The section's export text.
     */
    public exportText: string | null;


    /**
     * Creates a new {@link CapabilityGroupSectionView}.
     * @param file
     *  The mapping file view the item belongs to.
     * @param value
     *  The section's value or export value.
     * @param exportText
     *  The section's export text.
     */
    constructor(file: MappingFileView, value: string | null, exportText: string | null) {
        super(file, exportText ?? "No Capability Group", value);
        this.exportText = exportText;
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
        if(this.value && this.exportText && !obj.capabilityGroup.options.value.has(this.value)) {
            return EditorCommands.setListItemProperty(obj.capabilityGroup, this.value, this.exportText);
        } else {
            return EditorCommands.setListItemProperty(obj.capabilityGroup, this.value);
        }
    }

}
