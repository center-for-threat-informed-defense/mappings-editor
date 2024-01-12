import { MappingFileEditor } from '@/assets/scripts/MappingFileEditor';
import { EditorCommand, EditorDirectives } from "..";
import type { MappingFile } from "@/assets/scripts/MappingFile";
import type { ApplicationStore } from '@/stores/ApplicationStore';

export class SwapMappingFile extends EditorCommand {
    
    /**
     * The new file to swap.
     */
    public readonly mappingFile: MappingFile;

    /**
     * The application context.
     */
    private context: ApplicationStore;

    /**
     * Swaps the mapping file {@link MappingFile} in a mapping file editor {@link MappingFileEditor}.
     * @param file
     *  The mapping file to operate on.
     */
    constructor(file: MappingFile, context: ApplicationStore) {
        super();
        this.context = context;
        this.mappingFile = file;
    }


    /**
     * Executes the editor command.
     */
    public execute(): EditorDirectives {
        this.context.activeEditor.file = this.mappingFile;
        return EditorDirectives.RebuildBreakouts;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        return EditorDirectives.None;
    }

}
