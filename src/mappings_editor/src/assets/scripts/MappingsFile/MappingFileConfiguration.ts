import type { MappingObject } from "./MappingObject";

export type MappingFileConfiguration = {

    /**
     * The file's source framework.
     */
    sourceFramework: string,

    /**
     * The file's source framework version.
     */
    sourceVersion: string,

    /**
     * The file's target framework.
     */
    targetFramework: string,

    /**
     * The file's target framework version.
     */
    targetVersion: string,

    /**
     * The file's author.
     */
    author: string;

    /**
     * The author's e-mail.
     */
    authorContact: string;

    /**
     * The author's organization.
     */
    authorOrganization: string;

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
