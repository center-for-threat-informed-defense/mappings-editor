import type { MappingFileConfiguration as MappingFileConfiguration } from "./MappingFileConfiguration";
import type { MappingObject } from "./MappingObject";
import { DateProperty, StringProperty } from "./Property";

export class MappingFile {

    /**
     * The file's version.
     */
    public readonly version: StringProperty;

    /**
     * The file's source framework.
     */
    public readonly sourceFramework: StringProperty;

    /**
     * The file's source framework version.
     */
    public readonly sourceVersion: StringProperty;

    /**
     * The file's target framework.
     */
    public readonly targetFramework: StringProperty;

    /**
     * The file's target framework version.
     */
    public readonly targetVersion: StringProperty;

    /**
     * The file's author.
     */
    public readonly author: StringProperty;

    /**
     * The author's e-mail.
     */
    public readonly authorContact: StringProperty;

    /**
     * The author's organization.
     */
    public readonly authorOrganization: StringProperty;

    /**
     * The file's creation date.
     */
    public readonly creationDate: DateProperty;

    /**
     * The file's last modified date.
     */
    public readonly modifiedDate: DateProperty;

    /**
     * The file's mapping object template.
     */
    public readonly mappingObjectTemplate: MappingObject;


    /**
     * Creates a new {@link MappingFile}.
     * @param config
     *  The file's configuration.
     */
    constructor(config: MappingFileConfiguration) {
        this.version = new StringProperty(
            "Version"
        );
        this.sourceFramework = new StringProperty(
            "Source Framework",
            config.sourceFramework
        );
        this.sourceVersion = new StringProperty(
            "Source Framework Version",
            config.sourceVersion
        );
        this.targetFramework = new StringProperty(
            "Target Framework",
            config.targetFramework
        );
        this.targetVersion = new StringProperty(
            "Target Framework Version",
            config.targetVersion
        );
        this.author = new StringProperty(
            "Author",
            config.author
        );
        this.authorContact = new StringProperty(
            "Author Contact",
            config.authorContact
        );
        this.authorOrganization = new StringProperty(
            "Author Organization",
            config.authorOrganization
        );
        this.creationDate = new DateProperty(
            "Creation Date",
            config.creationDate
        );
        this.modifiedDate = new DateProperty(
            "Modified Date",
            config.modifiedDate
        );
        this.mappingObjectTemplate = config.mappingObjectTemplate;
    }


    /**
     * Inserts a mapping object into the mapping file.
     * @param object
     *  The mapping object to insert.
     */
    public insertMappingObject(object: MappingObject) {
        
    }

    /**
     * Removes a mapping object from the mapping file.
     * @param id
     *  The id of the mapping object.
     * @returns
     *  The removed mapping object.
     */
    public removeMappingObject(id: string): MappingObject;

    /**
     * Removes a mapping object from the mapping file.
     * @param obj
     *  The mapping object to remove.
     * @returns
     *  The removed mapping object.
     */
    public removeMappingObject(obj: string): MappingObject;
    public removeMappingObject(obj: MappingObject | string): MappingObject {
        const id = typeof obj === "string" ? obj : obj.id;
    }

}
