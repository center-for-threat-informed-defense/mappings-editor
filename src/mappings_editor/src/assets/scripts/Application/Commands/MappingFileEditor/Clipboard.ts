import { MappingObjectView } from "@/assets/scripts/MappingFileView";
import type { MappingFileView } from "@/assets/scripts/MappingFileView";
import type { MappingFileAuthority } from "@/assets/scripts/MappingFileAuthority";
import type { MappingFileSerializer } from "../..";

/**
 * Copies the selected {@link MappingObject}s to the clipboard.
 * @param fileSerializer
 *  A mapping file serializer.
 * @param fileAuthority
 *  A mapping file authority
 * @param fileView
 *  The mapping file view to operate on.
 * @returns
 *  The {@link MappingObjectView}s that were copied.
 */
export function executeCopy(
    fileSerializer: MappingFileSerializer,
    fileAuthority: MappingFileAuthority,
    fileView: MappingFileView
): MappingObjectView[] {
    // Select items
    const items = [...fileView.getItems(
        o => o instanceof MappingObjectView && o.selected
    )] as MappingObjectView[];
    // Serialize items
    const exports = fileAuthority.exportMappingObjects(items.map(o => o.object));
    const text = fileSerializer.processCopy(exports);
    // Transfer to clipboard
    navigator.clipboard.writeText(text);
    // Return objects
    return items;
}
