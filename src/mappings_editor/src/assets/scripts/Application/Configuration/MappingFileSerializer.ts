import type { MappingFileExport } from "../../MappingsFileAuthority";

export class MappingFileSerializer {

    /**
     * Creates a new {@link MappingFileSerializer}.
     */
    constructor(){}


    /**
     * Serializes a {@link MappingFileExport} to a string. 
     * @param file
     *  The file to serialize.
     */
    public serialize(file: MappingFileExport): string {
        return JSON.stringify(file, null, 4);
    }

    /**
     * Deserializes a string to a {@link MappingFileExport}. 
     * @param file
     *  The file to deserialize.
     */
    public deserialize(file: string): MappingFileExport {
        return JSON.parse(file);
    }

}
