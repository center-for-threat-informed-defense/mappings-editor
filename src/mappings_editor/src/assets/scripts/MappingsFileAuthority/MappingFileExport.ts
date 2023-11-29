import type { MappingObjectExport } from ".";

export type MappingFileExport = { 

    /**
     * The file's source framework.
     */
    source_framework: string,

    /**
     * The file's source framework version.
     */
    source_version: string,

    /**
     * The file's target framework.
     */
    target_framework: string,

    /**
     * The file's target framework version.
     */
    target_version: string,

    /**
     * The file's author.
     */
    author: string;

    /**
     * The author's e-mail.
     */
    author_contact: string;

    /**
     * The author's organization.
     */
    author_organization: string;

    /**
     * The file's creation date.
     */
    creation_date?: Date;

    /**
     * The file's last modified date.
     */
    modified_date?: Date;

    /**
     * The file's objects.
     */
    mapping_objects: MappingObjectExport[]

}
