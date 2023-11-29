import type { MappingFileConfiguration as MappingFileConfiguration } from "./MappingFileConfiguration";
import type { MappingObject } from "./MappingObject";

// TODO: Missing 'mappingTypes' and 'groups'

export class MappingFile {

    /**
     * The file's version.
     */
    public readonly version: string;

    /**
     * The file's source framework.
     */
    public readonly sourceFramework: string;

    /**
     * The file's source framework version.
     */
    public readonly sourceVersion: string;

    /**
     * The file's target framework.
     */
    public readonly targetFramework: string;

    /**
     * The file's target framework version.
     */
    public readonly targetVersion: string;

    /**
     * The file's author.
     */
    public readonly author: string;

    /**
     * The author's e-mail.
     */
    public readonly authorContact: string;

    /**
     * The author's organization.
     */
    public readonly authorOrganization: string;

    /**
     * The file's creation date.
     */
    public readonly creationDate: Date;

    /**
     * The file's last modified date.
     */
    public readonly modifiedDate: Date;

    /**
     * The file's mapping object template.
     */
    public readonly mappingObjectTemplate: MappingObject;

    /**
     * The file's mapping objects.
     */
    public readonly mappingObjects: ReadonlyMap<string, MappingObject>;


    /**
     * Creates a new {@link MappingFile}.
     * @param config
     *  The file's configuration.
     */
    constructor(config: MappingFileConfiguration) {
        this.version = ""
        this.sourceFramework = config.sourceFramework;
        this.sourceVersion = config.sourceVersion;
        this.targetFramework = config.targetFramework;
        this.targetVersion = config.targetVersion;
        this.author = config.author;
        this.authorContact = config.authorContact;
        this.authorOrganization = config.authorOrganization;
        this.creationDate = config.creationDate
        this.modifiedDate = config.modifiedDate;
        this.mappingObjectTemplate = config.mappingObjectTemplate;
        this.mappingObjects = new Map<string, MappingObject>();
    }


    /**
     * Inserts a mapping object into the mapping file.
     * @param object
     *  The mapping object to insert.
     */
    public insertMappingObject(object: MappingObject) {
        // Configure object's file
        object.file = this;
        // Configure file's object
        (this.mappingObjects as Map<string, MappingObject>).set(object.id, object);
    }

    /**
     * Removes a mapping object from the mapping file.
     * @param id
     *  The id of the mapping object.
     * @returns
     *  The removed mapping object.
     */
    public removeMappingObject(id: string): void;

    /**
     * Removes a mapping object from the mapping file.
     * @param obj
     *  The mapping object to remove.
     * @returns
     *  The removed mapping object.
     */
    public removeMappingObject(obj: MappingObject): void;
    public removeMappingObject(obj: MappingObject | string) {
        const id = typeof obj === "string" ? obj : obj.id;
        if(this.mappingObjects.has(id)) {
            obj = this.mappingObjects.get(id)!;
            // Configure object's file
            obj.file = null;
            // Configure file's object.
            (this.mappingObjects as Map<string, MappingObject>).delete(id);
        }
    }

}
