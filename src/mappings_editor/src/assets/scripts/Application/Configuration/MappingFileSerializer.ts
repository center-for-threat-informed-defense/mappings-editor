import type { MappingFileExport, MappingObjectExport } from "../../MappingFileAuthority";

export class MappingFileSerializer {

    /**
     * Creates a new {@link MappingFileSerializer}.
     */
    constructor(){}


    /**
     * Serializes a {@link MappingFileExport} to a string. 
     * @param file
     *  The file to serialize.
     * @returns
     *  The serialized {@link MappingFileExport}.
     */
    public serialize(file: MappingFileExport): string {
        return JSON.stringify(file, null, 4);
    }

    /**
     * Deserializes a string to a {@link MappingFileExport}. 
     * @param file
     *  The file to deserialize.
     * @returns
     *  The deserialized {@link MappingFileExport}.
     */
    public deserialize(file: string): MappingFileExport {
        return JSON.parse(file);
    }

    /**
     * Serializes a list of {@link MappingObjectExport}s to the clipboard.
     * @param objects
     *  The objects to serialize.
     * @returns
     *  The serialized {@link MappingObjectExport}s.
     */
    public processCopy(objects: MappingObjectExport[]): string {
        return JSON.stringify(objects);
    } 

    /**
     * Deserializes a list of {@link MappingFileExport}s from the clipboard.
     * @param str
     *  The objects to deserialize.
     * @param file
     *  The file being pasted into.
     * @returns
     *  The deserialized {@link MappingFileExport}s.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public processPaste(str: string, file: MappingFileExport): MappingObjectExport[] {
        const exports: MappingObjectExport[] = []
        try {
            const items = JSON.parse(str);
            if(!Array.isArray(items)) {
                return exports;
            }
            // Parse items
            for(const item of items) {
                if(typeof item !== "object") {
                    continue;
                }
                // Compile references
                const references = []
                if(Array.isArray(item.references)) {
                    for(const str of item.references) {
                        if(typeof str === "string") {
                            references.push(str);
                        }
                    }
                }
                // Compile export
                exports.push({
                    source_id           : item.source_id ?? null,
                    source_text         : item.source_text ?? null,
                    source_version      : item.source_version ?? null,
                    source_framework    : item.source_framework ?? null,
                    target_id           : item.target_id ?? null,
                    target_text         : item.target_text ?? null,
                    target_version      : item.target_version ?? null,
                    target_framework    : item.target_framework ?? null,
                    author              : item.author ?? null,
                    author_contact      : item.author_contact ?? null,
                    author_organization : item.author_organization ?? null,
                    references,
                    comments            : item.comments ?? null,
                    capability_group    : item.capability_group ?? null,
                    mapping_type        : item.mapping_type ?? null,
                    mapping_status      : item.mapping_status ?? null,
                    score_category      : item.score_category ?? null,
                    score_value         : item.score_value ?? null
                })
            }
            return exports;
        } catch {
            return exports;
        }
    }

}
