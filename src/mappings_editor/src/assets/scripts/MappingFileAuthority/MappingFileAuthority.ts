import { Reactivity } from ".";
import { MappingFile } from "../MappingFile/MappingFile";
import { 
    DynamicFrameworkObjectProperty, 
    EditableDynamicFrameworkListing, 
    EditableStrictFrameworkListing, 
    FrameworkObjectProperty,
    ListItem,
    ListProperty, 
    MappingObject,
    StrictFrameworkObjectProperty,
    StringProperty,
} from "../MappingFile";
import type { FrameworkRegistry } from "./FrameworkRegistry";
import type { MappingFileExport, MappingObjectExport } from "./MappingFileExport";

export class MappingFileAuthority {

    /**
     * The mapping authority's framework registry.
     */
    public readonly registry: FrameworkRegistry;


    /**
     * Creates a new {@link MappingFileAuthority}.
     * @param registry
     *  The mapping authority's framework registry.
     */
    constructor(registry: FrameworkRegistry) {
        this.registry = registry;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Create Mapping File  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates a blank Mapping file.
     * @param file
     *  The file's configuration.
     * @param id
     *  The file's id.
     * @returns
     *  The blank Mapping File.
     */
    public async createEmptyMappingFile(file: MappingFileExport, id?: string): Promise<MappingFile> {

        const sf = file.source_framework,
              sv = file.source_version,
              tf = file.target_framework,
              tv = file.target_version
        
        // Create template mapping object
        const mappingObjectTemplate = new MappingObject({
            sourceObject       : await this.createFrameworkObjectProp(sf, sv),
            targetObject       : await this.createFrameworkObjectProp(tf, tv),
            author             : new StringProperty("Author", file.author),
            authorContact      : new StringProperty("Author E-mail", file.author_contact),
            authorOrganization : new StringProperty("Author Organization", file.author_organization)
        });
        
        // Create mapping file
        const mappingFile = new MappingFile({
            creationDate       : file.creation_date,
            modifiedDate       : file.modified_date,
            mappingObjectTemplate
        }, id);

        // Load dictionaries into file lists
        const stringTransform 
            = (id: string, name: string) => ({ id, name });
        const objectTransform
            = (id: string, { name, description }: any) => ({ id, name, description });
        ([
            [mappingFile.capabilityGroups, file.capability_groups, stringTransform],
            [mappingFile.mappingTypes, file.mapping_types, objectTransform],
            [mappingFile.mappingStatuses, file.mapping_statuses, stringTransform],
            [mappingFile.scoreCategories, file.score_categories, stringTransform],
            [mappingFile.scoreValues, file.score_values, stringTransform]
        ] as [ListProperty, { [key: string]: any }, any][]).forEach(
            args => this.populateListPropertyFromDictionary(...args)
        );

        // Set default mapping status
        if((file.default_mapping_status || null) !== null) {
            const mappingStatus = mappingFile.mappingStatuses.findListItemId(
                o => o.getAsString("id") === file.default_mapping_status
            ) ?? null;
            mappingObjectTemplate.mappingStatus.value = mappingStatus;
        }

        // Set default mapping type
        if((file.default_mapping_type || null) !== null) {
            const mappingType = mappingFile.mappingTypes.findListItemId(
                o => o.getAsString("id") === file.default_mapping_type
            ) ?? null;
            mappingObjectTemplate.mappingType.value = mappingType
        }
        
        return mappingFile;

    }

    /**
     * Creates an empty {@link FrameworkObjectProperty}.
     * @param id
     *  The framework's id.
     * @param version
     *  The framework's version.
     * @returns
     *  The newly created {@link FrameworkObjectProperty}.
     */
    private async createFrameworkObjectProp(id: string, version: string): Promise<FrameworkObjectProperty> {
        
        // If the registry has the framework...
        if(this.registry.hasFramework(id, version)) {
            // ...create a strict framework object property
            const framework = await this.registry.getFramework(id, version);
            const listing = new EditableStrictFrameworkListing(id, version);
            for(const name in framework.categories) {
                const category = framework.categories[name];
                for(const object of category){
                    listing.registerObject(object.id, object.name);
                }
            }
            return new StrictFrameworkObjectProperty("", listing);
        }

        // If the registry does not have the framework...
        else {
            // ...create a dynamic framework object property
            const listing = new EditableDynamicFrameworkListing(id, version);
            return new DynamicFrameworkObjectProperty("", listing);
        }
        
    }

    /**
     * Populates a {@link ListProperty} with a dictionary of values.
     * @param prop
     *  The {@link ListProperty} to populate.
     * @param object
     *  The dictionary of values.
     * @param defineItem
     *  A function which accepts a dictionary key/value pair and returns an
     *  object which defines a new list item.
     */
    private populateListPropertyFromDictionary (
        prop: ListProperty,
        object: { [key: string]: any },
        defineItem: (key: string, value: any) => { [key: string]: any }
    ) {
        for(const key in object) {
            const item = prop.createNewItem(defineItem(key, object[key]));
            prop.insertListItem(item);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Load Mapping File  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Loads a Mapping File export.
     * @param file
     *  The exported file.
     * @param id
     *  The file's id.
     * @returns
     *  The loaded Mapping File.
     */
    public async loadMappingFile(file: MappingFileExport, id?: string): Promise<MappingFile> {
        const rawThis = Reactivity.toRaw(this);
        // Create new file
        const newFile = await rawThis.createEmptyMappingFile(file, id);
        // Load mapping objects into file
        for(const obj of file.mapping_objects) {
            // Load mapping object
            const newObject = rawThis.initializeMappingObjectExport(obj, newFile);
            // Insert mapping object  
            newFile.insertMappingObject(newObject);
        }
        return newFile;
    }

    /**
     * Initializes a {@link MappingObject} from a {@link MappingFileExport}.
     * @param obj
     *  The exported object.
     * @param file
     *  The {@link MappingFile} the {@link MappingObject} should be linked to.
     * @returns
     *  The newly created {@link MappingObject}.
     */
    public initializeMappingObjectExport(obj: MappingObjectExport, file: MappingFile): MappingObject {
        // Create mapping object
        const newObject = file.createMappingObject();
        // Load framework object property values
        newObject.sourceObject.cacheObjectValue(
            obj.source_id || null,
            obj.source_text || null,
            obj.source_framework,
            obj.source_version
        );
        newObject.targetObject.cacheObjectValue(
            obj.target_id || null,
            obj.target_text || null,
            obj.target_framework,
            obj.target_version
        );
        // Configure author
        if(obj.author) {
            newObject.author.value = obj.author || null;
        }
        if(obj.author_contact) {
            newObject.authorContact.value = obj.author_contact || null
        }
        if(obj.author_organization) {
            newObject.authorOrganization.value = obj.author_organization || null;
        }
        // Configure references
        for(const url of obj.references) {
            if(url === "") {
                continue;
            }
            newObject.references.insertListItem(
                newObject.references.createNewItem({ url })
            )
        }
        // Configure comments
        newObject.comments.value = obj.comments || null;
        // Configure mapping type
        newObject.capabilityGroup.exportValue  = obj.capability_group || null;
        newObject.mappingType.exportValue      = obj.mapping_type || null;
        newObject.mappingStatus.exportValue    = obj.mapping_status || null;
        newObject.scoreCategory.exportValue    = obj.score_category || null;
        newObject.scoreValue.exportValue       = obj.score_value || null;
        // Return object
        return newObject;
    }
    

    ///////////////////////////////////////////////////////////////////////////
    //  3. Import Mapping File  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Imports one mapping file into another.
     * @param file
     *  The file to import into.
     * @param importFile
     *  The file to import.
     * @returns
     *  The ids of the imported mapping objects.
     */
    public importMappingFile(file: MappingFile, importFile: MappingFileExport): Set<string> {
        const rawThis = Reactivity.toRaw(this);
        const rawFile = Reactivity.toRaw(file);
        const imported = new Map();
        // Initialize mapping objects
        for (const objectExport of importFile.mapping_objects){
            const obj = rawThis.initializeMappingObjectExport(objectExport, rawFile);
            imported.set(obj.id, obj);
        }
        // Insert mapping objects
        file.insertMappingObjectsAfter([...imported.values()]);
        // Return ids
        return new Set([...imported.keys()]);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Migrate Mapping File  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Migrates an existing Mapping File to a new Mapping File.
     * @param file
     *  The existing Mapping File.
     * @param newFile
     *  The new Mapping File.
     * @returns
     *  The migrated Mapping File.
     */
    public async migrateMappingFile(file: MappingFile, newFile: MappingFileExport): Promise<MappingFile> {
        const migratedFile = await this.createEmptyMappingFile(newFile);
        return migratedFile;
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  5. Audit Mapping File  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    public auditMappingObject(object: MappingObject) {
        if(object.file === null) {
            throw new Error(`Mapping '${ object.id }' must be belong to a Mapping File to be audited.`)
        }
    }
    
    
    ///////////////////////////////////////////////////////////////////////////
    //  6. Export Mapping File  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Exports a Mapping File to a plain JSON object.
     * @param file
     *  The Mapping File to export.
     * @returns
     *  The exported Mapping File.
     */
    public exportMappingFile(file: MappingFile): MappingFileExport;
    
    /**
     * Exports a Mapping File to a plain JSON object.
     * @param file
     *  The Mapping File to export.
     * @param includeObjects
     *  True to include the mapping objects, false otherwise.
     * @returns
     *  The exported Mapping File.
     */
    public exportMappingFile(file: MappingFile, includeObjects: boolean): MappingFileExport;
    public exportMappingFile(file: MappingFile, includeObjects: boolean = true): MappingFileExport {
        
        // Convert list properties to maps
        const stringTransform 
            = (item: ListItem) => item.getAsString("name");
        const objectTransform
            = (item: ListItem) => ({ 
                name        : item.getAsString("name"),
                description : item.getAsString("description")
            });
        const argSets: [ListProperty, string, any][] = [
            [file.capabilityGroups, "id", stringTransform],
            [file.mappingTypes, "id", objectTransform],
            [file.mappingStatuses, "id", stringTransform],
            [file.scoreCategories, "id", stringTransform],
            [file.scoreValues, "id", stringTransform]
        ];
        const [
            capability_groups,
            mapping_types,
            mapping_statuses,
            score_categories,
            score_values
        ] = argSets.map(
            args => this.convertListPropertyToDictionary(...args)
        );
        
        // Compile objects
        let mapping_objects: MappingObjectExport[] = [];
        if(includeObjects) {
            mapping_objects = this.exportMappingObjects([...file.mappingObjects.values()])
        }

        // Compile file
        return {
            version                : file.version,
            source_framework       : file.sourceFramework,
            source_version         : file.sourceVersion,
            target_framework       : file.targetFramework,
            target_version         : file.targetVersion,
            author                 : file.author.value,
            author_contact         : file.authorContact.value,
            author_organization    : file.authorOrganization.value,
            creation_date          : file.creationDate,
            modified_date          : file.modifiedDate,
            capability_groups      : Object.fromEntries(capability_groups),
            mapping_types          : Object.fromEntries(mapping_types),
            mapping_statuses       : Object.fromEntries(mapping_statuses),
            score_categories       : Object.fromEntries(score_categories),
            score_values           : Object.fromEntries(score_values),
            mapping_objects,
            default_mapping_type   : file.defaultMappingType,
            default_mapping_status : file.defaultMappingStatus
        }

    }

    /**
     * Exports Mapping Objects to plain JSON objects.
     * @param objs
     *  The Mapping Objects to export.
     * @returns
     *  The exported Mapping Objects.
     */
    public exportMappingObjects(objs: MappingObject[]): MappingObjectExport[] {
        const mappingObjects = [];
        for(const obj of objs) {
            // Compile references
            const references = [...obj.references.value.values()]
                .map(o => o.getAsString("url"))
            // Compile mapping object
            mappingObjects.push({
                source_id           : obj.sourceObject.objectId,
                source_text         : obj.sourceObject.objectText,
                source_version      : obj.sourceObject.objectVersion,
                source_framework    : obj.sourceObject.objectFramework,
                target_id           : obj.targetObject.objectId,
                target_text         : obj.targetObject.objectText,
                target_version      : obj.targetObject.objectVersion,
                target_framework    : obj.targetObject.objectFramework,
                author              : obj.author.value,
                author_contact      : obj.authorContact.value,
                author_organization : obj.authorOrganization.value,
                references,
                comments            : obj.comments.value,
                capability_group    : obj.capabilityGroup.exportValue,
                mapping_type        : obj.mappingType.exportValue,
                mapping_status      : obj.mappingStatus.exportValue,
                score_category      : obj.scoreCategory.exportValue,
                score_value         : obj.scoreValue.exportValue
            })
        }
        return mappingObjects;
    }


    /**
     * Coverts a {@link ListProperty} to a dictionary of values. 
     * @param prop
     *  The {@link ListProperty} to convert.
     * @param key
     *  The identifying subproperty of each {@link ListItem}.
     * @param defineValue
     *  A function which accepts a list item and returns the item's dictionary value.
     * @returns
     *  A dictionary of values.
     */
    private convertListPropertyToDictionary(
        prop: ListProperty,
        key: string,
        defineValue: (item: ListItem) => any
    ) {
        const map = new Map();
        const clone = prop.duplicate();
        this.deduplicateListProperty(clone, key);
        for(const item of clone.value.values()) {
            map.set(item.getAsString(key), defineValue(item));
        }
        return map;
    }

    /**
     * Deduplicates a {@link ListProperty}, in-place, according to each
     * {@link ListItem}'s identifying subproperty.
     * @param prop
     *  The {@link ListProperty} to deduplicate.
     * @param key
     *  The identifying subproperty of each {@link ListItem}.
     */
    private deduplicateListProperty(prop: ListProperty, key: string) {
        const ids = new Set();
        for(const type of prop.value.values()) {
            const subProp = type.get(key);
            if(subProp instanceof StringProperty) {
                let id = subProp.value;
                for(let i = 1; ids.has(id); id = `${ subProp }_${ i }`);
                subProp.value = id;
                ids.add(id);
            } else {
                throw new Error(`Cannot deduplicate subproperty of type '${
                    subProp.constructor.name
                }'.`)
            }
        }
    }

}
