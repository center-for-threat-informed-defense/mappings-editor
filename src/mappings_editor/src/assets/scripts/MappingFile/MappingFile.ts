import { randomUUID } from "../Utilities";
import { FrameworkListing, ListProperty, StringProperty } from ".";
import type { MappingObject } from "./MappingObject";
import type { MappingFileConfiguration } from "./MappingFileConfiguration";

export class MappingFile {

    /**
     * The file's id.
     */
    public readonly id: string;

    /**
     * The file's version.
     */
    public readonly version: string;

    /**
     * The file's source framework listing.
     */
    public readonly sourceFrameworkListing: FrameworkListing;

    /**
     * The file's source framework.
     */
    public readonly sourceFramework: string;

    /**
     * The file's source framework version.
     */
    public readonly sourceVersion: string;

    /**
     * The file's target framework listing.
     */
    public readonly targetFrameworkListing: FrameworkListing;

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
    public readonly creationDate: Date;

    /**
     * The file's last modified date.
     */
    public readonly modifiedDate: Date;

    /**
     * The file's mapping types.
     */
    public readonly mappingTypes: ListProperty;

    /**
     * The file's mapping groups.
     */
    public readonly mappingGroups: ListProperty;

    /**
     * The file's mapping statuses.
     */
    public readonly mappingStatuses: ListProperty;

    /**
     * The file's score categories.
     */
    public readonly scoreCategories: ListProperty;

    /**
     * The file's score values.
     */
    public readonly scoreValues: ListProperty;

    /**
     * The file's mapping objects.
     */
    public mappingObjects: ReadonlyMap<string, MappingObject>;

    /**
     * The file's mapping object template.
     */
    private readonly _mappingObjectTemplate: MappingObject;


    /**
     * Creates a new {@link MappingFile}.
     * @param config
     *  The file's configuration.
     */
    constructor(config: MappingFileConfiguration);

    /**
     * Creates a new {@link MappingFile}.
     * @param config
     *  The file's configuration.
     * @param id
     *  The file's id.
     */
    constructor(config: MappingFileConfiguration, id?: string);
    constructor(config: MappingFileConfiguration, id?: string) {
        const template = config.mappingObjectTemplate;
        this.id = id ?? randomUUID();
        this.version = ""
        this.author = template.author;
        this.authorContact = template.authorContact;
        this.authorOrganization = template.authorOrganization;
        this.creationDate = config.creationDate
        this.modifiedDate = config.modifiedDate;
        this.mappingTypes = template.mappingType.options;
        this.mappingGroups = template.mappingGroup.options;
        this.mappingStatuses = template.mappingStatus.options;
        this.scoreCategories = template.scoreCategory.options;
        this.scoreValues = template.scoreValue.options;
        this.mappingObjects = new Map<string, MappingObject>();
        this._mappingObjectTemplate = template;
        // Configure source information
        const sourceListing = template.sourceObject.framework;
        this.sourceFrameworkListing = sourceListing;
        this.sourceFramework = sourceListing.id;
        this.sourceVersion = sourceListing.version;
        // Configure target information
        const targetListing = template.targetObject.framework;
        this.targetFrameworkListing = targetListing;
        this.targetFramework = targetListing.id;
        this.targetVersion = targetListing.version;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Mapping Object Management  /////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates a new mapping object.
     * @remarks
     *  This function only creates a mapping object, it doesn't insert into the
     *  file. Use {@link MappingFile.insertMappingObject} to insert the object.
     * @returns
     *  The new mapping object.
     */
    public createMappingObject(): MappingObject {
        return this._mappingObjectTemplate.duplicate();
    }
    
    /**
     * Returns the index of a mapping object in the file.
     * @param id
     *  The mapping object's id.
     * @returns
     *  The index of a mapping object in the file.
     */
    public getMappingObjectIndex(id: string): number;

    /**
     * Returns the index of a mapping object in the file.
     * @param id
     *  The mapping object.
     * @returns
     *  The index of a mapping object in the file.
     */
    public getMappingObjectIndex(obj: MappingObject): number;
    public getMappingObjectIndex(obj: MappingObject | string): number {
        const id = typeof obj === "string" ? obj : obj.id;
        return [...this.mappingObjects.keys()].findIndex(o => o === id);
    }

    /**
     * Inserts a mapping object into the mapping file.
     * @param object
     *  The mapping object to insert.
     */
    public insertMappingObject(object: MappingObject): void;
    
    /**
     * Inserts a mapping object into the mapping file.
     * @param object
     *  The mapping object to insert.
     * @param index
     *  The index to insert the object at.
     */
    public insertMappingObject(object: MappingObject, index: number): void;
    public insertMappingObject(object: MappingObject, index?: number) {
        if(this.mappingObjects.has(object.id)) {
            throw new Error(`Mapping file already contains object '${ object.id }'.`);
        }
        // Configure object's file
        object.file = this;
        // Configure file's object
        if(index !== undefined) {
            const items = [...this.mappingObjects];
            items.splice(index, 0, [object.id, object]);
            this.mappingObjects = new Map(items);
        } else {
            (this.mappingObjects as Map<string, MappingObject>)
                .set(object.id, object);
        }
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
