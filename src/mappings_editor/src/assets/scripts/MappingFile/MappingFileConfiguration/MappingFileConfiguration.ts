import type { MappingObject } from "../MappingObject";

export type MappingFileConfiguration = {

    /**
     * The file's creation date.
     */
    creationDate: Date;

    /**
     * The file's last modified date.
     */
    modifiedDate: Date;

    /**
     * The file's mapping object template.
     */
    mappingObjectTemplate: MappingObject;

}
