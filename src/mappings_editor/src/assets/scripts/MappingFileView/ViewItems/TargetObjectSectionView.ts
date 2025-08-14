import * as EditorCommands from "../../MappingFileEditor/EditorCommands";
import { BreakoutSectionView } from ".";
import { EditorCommand } from "../../MappingFileEditor";
import type { MappingObject } from "@/assets/scripts/MappingFile";
import type { MappingFileView } from "..";

export class TargetObjectSectionView extends BreakoutSectionView {
    
    /**
     * The section's object text.
     */
    public readonly objectText: string | null;

    
    /**
     * Creates a new {@link TargetObjectSectionView}.
     * @param file
     *  The mapping file view the item belongs to.
     * @param objectId
     *  The section's object id.
     * @param objectText
     *  The section's object text.
     */
    constructor(file: MappingFileView, objectId: string | null, objectText: string | null) {
        const name = objectId === null ? "No Target" : `${ objectId }: ${ objectText }`;
        super(file, name, objectId);
        this.objectText = objectText;
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
        // TODO: Sections with invalid values need to have their framework and version transferred,
        // but only if the framework and version don't match the source file.
        if(this.value && !obj.targetObject.framework.has(this.value, this.objectText)) {
            return EditorCommands.setFrameworkObjectPropertyId(obj.targetObject, this.value, this.objectText);
        } else {
            return EditorCommands.setFrameworkObjectPropertyId(obj.targetObject, this.value);
        } 
    }

}
