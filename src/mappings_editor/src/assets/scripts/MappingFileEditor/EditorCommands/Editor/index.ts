import { SwapMappingFile } from './../Editor/SwapFileCommand';
import { MappingFileEditor } from '@/assets/scripts/MappingFileEditor';
import type { EditorCommand } from "..";
import type { MappingFile } from "@/assets/scripts/MappingFile";
import type { ApplicationStore } from '@/stores/ApplicationStore';


/**
 * Swaps the mapping file {@link MappingFile} in a Mapping Editor {@link MappingFileEditor} 
 * @param file
 *  The mapping file to operate on.
 * @returns
 *  A command that represents the action.
 */
export function swapMappingFile(file: MappingFile, context: ApplicationStore): EditorCommand {
    return new SwapMappingFile(file, context); 
}