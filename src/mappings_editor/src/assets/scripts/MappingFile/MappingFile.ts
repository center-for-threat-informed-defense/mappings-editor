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
     * The file's capability groups.
     */
    public readonly capabilityGroups: ListProperty;

    /**
     * The file's mapping types.
     */
    public readonly mappingTypes: ListProperty;

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
     * The file's internal mapping objects.
     */
    private _mappingObjects: Map<string, MappingObject>;

    /**
     * The file's mapping object template.
     */
    private readonly _mappingObjectTemplate: MappingObject;

    /**
     * The file's mapping objects.
     */
    public get mappingObjects(): ReadonlyMap<string, MappingObject> {
        return this._mappingObjects;
    }


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
        this.capabilityGroups = template.capabilityGroup.options;
        this.mappingTypes = template.mappingType.options;
        this.mappingStatuses = template.mappingStatus.options;
        this.scoreCategories = template.scoreCategory.options;
        this.scoreValues = template.scoreValue.options;
        this._mappingObjects = new Map<string, MappingObject>();
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
     * Returns the mapping object placed before the provided object.
     * @param id
     *  The mapping object's id.
     * @returns
     *  The mapping object placed before the provided object.
     */
    public getMappingObjectBefore(id: string): MappingObject | undefined;

    /**
     * Returns the mapping object placed before the provided object.
     * @param id
     *  The mapping object.
     * @returns
     *  The mapping object placed before the provided object.
     */
    public getMappingObjectBefore(obj: MappingObject): MappingObject | undefined;
    public getMappingObjectBefore(obj: MappingObject | string): MappingObject | undefined {
        // Resolve id
        const id = typeof obj === "string" ? obj : obj.id;
        if(!this._mappingObjects.has(id)) {
            throw new Error(`Mapping file doesn't contain object '${ id }'.`);
        }
        // Resolve object
        const items = [...this._mappingObjects];
        const index = items.findIndex(([objId]) => objId === id) - 1;
        if(-1 < index) {
            return items[index][1];
        } else {
            return undefined;
        }
    }

    /**
     * Inserts a mapping object into the mapping file.
     * @param object
     *  The mapping object to insert.
     */
    public insertMappingObject(object: MappingObject) {
        if(this._mappingObjects.has(object.id)) {
            throw new Error(`Mapping file already contains object '${ object.id }'.`);
        }
        // Try uncache source and target objects
        object.sourceObject.tryUncacheObjectValue();
        object.targetObject.tryUncacheObjectValue();
        // Configure object's file
        object.file = this;
        // Configure file's object
        this._mappingObjects.set(object.id, object);
    }

    /**
     * Inserts a mapping object after another mapping object.
     * @param object
     *  The mapping object to insert.
     * @param destination
     *  The destination object's id.
     */
    public insertMappingObjectAfter(object: MappingObject, id?: string): void;

    /**
     * Inserts a mapping object after another mapping object.
     * @param object
     *  The mapping object to insert.
     * @param destination
     *  The destination object.
     */
    public insertMappingObjectAfter(object: MappingObject, destination?: string): void;
    public insertMappingObjectAfter(object: MappingObject, destination?: MappingObject | string) {
        const id = typeof destination === "string" ? destination : (destination?.id ?? null)
        if(this._mappingObjects.has(object.id)) {
            throw new Error(`Mapping file already contains object '${ object.id }'.`);
        }
        // Try uncache source and target objects
        object.sourceObject.tryUncacheObjectValue();
        object.targetObject.tryUncacheObjectValue();
        // Configure object's file
        object.file = this;
        // Configure file's object
        const items = [...this._mappingObjects];
        const index = id === undefined ? -1 : items.findIndex(([_id]) => _id === id);
        items.splice(index + 1, 0, [object.id, object]);
        this._mappingObjects = new Map(items);
    }

    /**
     * Inserts multiple mapping objects after another mapping object.
     * @param object
     *  The mapping object to insert.
     * @param id
     *  The destination object's id.
     */
    public insertMappingObjectsAfter(objects: MappingObject[], id?: string): void;

    /**
     * Inserts multiple mapping objects after another mapping object.
     * @param object
     *  The mapping object to insert.
     * @param destination
     *  The destination object.
     */
    public insertMappingObjectsAfter(objects: MappingObject[], destination?: string): void;
    public insertMappingObjectsAfter(objects: MappingObject[], destination?: MappingObject | string) {
        const id = typeof destination === "string" ? destination : (destination?.id ?? null)
        const newEntries: [string, MappingObject][] = [];
        for(const obj of objects){
            if(this._mappingObjects.has(obj.id)) {
                throw new Error(`Mapping file already contains object '${ obj.id }'.`);
            }
            newEntries.push([obj.id, obj]);
            // Try uncache source and target objects
            obj.sourceObject.tryUncacheObjectValue();
            obj.targetObject.tryUncacheObjectValue();
            // Configure object's file
            obj.file = this;
        }
        // Configure file's object
        const items = [...this._mappingObjects];
        const index = id === undefined ? -1 : items.findIndex(([_id]) => _id === id);
        items.splice(index + 1, 0, ...newEntries);
        this._mappingObjects = new Map(items);   
    }

    /**
     * Removes a mapping object from the mapping file.
     * @param id
     *  The id of the mapping object.
     */
    public removeMappingObject(id: string): void;

    /**
     * Removes a mapping object from the mapping file.
     * @param obj
     *  The mapping object to remove.
     */
    public removeMappingObject(obj: MappingObject): void;
    public removeMappingObject(obj: MappingObject | string) {
        const id = typeof obj === "string" ? obj : obj.id;
        if(this._mappingObjects.has(id)) {
            obj = this._mappingObjects.get(id)!;
            // Cache source and target objects
            obj.sourceObject.cacheObjectValue();
            obj.targetObject.cacheObjectValue();
            // Configure object's file
            obj.file = null;
            // Configure file's object.
            this._mappingObjects.delete(id);
        }
    }

    /**
     * Removes multiple mapping objects from the mapping file.
     * @param ids
     *  The ids of the mapping objects.
     */
    public removeMappingObjects(ids: string[]): void;

    /**
     * Removes multiple mapping objects from the mapping file.
     * @param obj
     *  The mapping objects to remove.
     */
    public removeMappingObjects(objs: MappingObject[]): void;
    public removeMappingObjects(objs: MappingObject[] | string[]) {
        // Collect ids
        const ids = new Array(objs.length);
        for(let i = 0, obj = objs[i]; i < objs.length; i++, obj = objs[i]) {
            ids[i] = typeof obj === "string" ? obj : obj.id;
        }
        // Clone mapping objects
        const clone = Object.freeze(new Map([...this._mappingObjects]));
        // Remove mapping objects
        let obj;
        for(const id of ids) {
            // Lookup object
            if(!(obj = this._mappingObjects.get(id))) {
                continue;
            }
            // Cache source and target objects
            obj.sourceObject.cacheObjectValue();
            obj.targetObject.cacheObjectValue();
            // Configure object's file
            obj.file = null;
            // Configure file's object.
            clone.delete(id);
        }
        // Reassign mapping objects
        this._mappingObjects = clone;
    }

}
