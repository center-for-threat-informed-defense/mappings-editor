import { MappingFile } from "../MappingsFile/MappingFile";
import type { FrameworkRegistry } from "./FrameworkRegistry";
import type { MappingFileExport, MappingObjectExport } from "./MappingFileExport";
import { 
    DynamicFrameworkObjectProperty, 
    EditableDynamicFrameworkListing, 
    EditableStrictFrameworkListing, 
    FrameworkObjectProperty, 
    FreeFrameworkObjectProperty,
    ListItemProperty, 
    ListProperty, 
    MappingObject,
    StrictFrameworkObjectProperty,
    StringProperty,
} from "../MappingsFile";
import { randomUUID } from "../Utilities";

export class MappingsFileAuthority {

    /**
     * The unknown framework identifier.
     * @remarks
     *  A UUID is used to ensure the unknown framework never accidentally
     *  collides with a known framework.
     */
    public static UNKNOWN_FRAMEWORK_ID: string
        = `[UNKNOWN_FRAMEWORK:${ randomUUID() }]`;

    /**
     * The unknown framework version.
     * @remarks
     *  A UUID is used to ensure the unknown framework version never
     *  accidentally collides with a known framework version.
     */
    public static UNKNOWN_FRAMEWORK_VERSION: string
        = `[UNKNOWN_VERSION:${ randomUUID() }]`;

    /**
     * The mapping authority's framework registry.
     */
    public readonly registry: FrameworkRegistry;


    /**
     * Creates a new {@link MappingsFileAuthority}.
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
     * @returns
     *  The blank Mapping File.
     */
    public async createEmptyMappingFile(file: MappingFileExport) {

        const sf = file.source_framework,
              sv = file.source_version,
              tf = file.target_framework,
              tv = file.target_version
        
        // Create template mapping object
        const mappingObjectTemplate = new MappingObject({
            sourceObject       : await this.createFrameworkObjectProp(sf, sv),
            targetObject       : await this.createFrameworkObjectProp(tf, tv),
            author             : new StringProperty(file.author),
            authorContact      : new StringProperty(file.author_contact),
            authorOrganization : new StringProperty(file.author_organization),
            comments           : new StringProperty(file.author_contact)
        });
        
        // Create mapping file
        const mappingFile = new MappingFile({
            creationDate       : file.creation_date ?? new Date(),
            modifiedDate       : file.modified_date ?? new Date(),
            mappingObjectTemplate
        });
        
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
                    listing.registerListing(object.id, object.name);
                }
            }
            return new StrictFrameworkObjectProperty(listing);
        }

        // If the registry does not have the framework...
        else {
            // ...create a dynamic framework object property
            const listing = new EditableDynamicFrameworkListing(id, version);
            return new DynamicFrameworkObjectProperty(listing);
        }
        
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Load Mapping File  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Loads a Mapping File export.
     * @param file
     *  The exported Mapping File.
     * @returns
     *  The loaded Mapping File.
     */
    public async loadMappingFile(file: MappingFileExport): Promise<MappingFile> {

        // Create new file
        const newFile = await this.createEmptyMappingFile(file);
        
        // Load mapping types into file
        const mappingTypeIdToItemIdMap = this.populateListPropertyFromDictionary(
            newFile.mappingTypes, file.mapping_types,
            (id, { name, description }) => ({ id, name, description })
        )
        
        // Load mapping groups into file
        const mappingGroupIdToItemIdMap = this.populateListPropertyFromDictionary(
            newFile.mappingGroups, file.mapping_groups,
            (id, name) => ({ id, name })
        );

        // Load mapping statuses into file
        const mappingStatusIdToItemIdMap = this.populateListPropertyFromDictionary(
            newFile.mappingStatuses, file.mapping_statuses,
            (id, name) => ({ id, name })
        );
        
        // Load mapping objects into file
        for(const obj of file.mapping_objects) {
            // Create mapping object
            const newObject = newFile.createMappingObject();
            // Load framework object property values
            this.populateFrameworkObjectProperty(
                newObject.sourceObject,
                obj.source_id,
                obj.source_text,
                obj.source_framework ?? newFile.sourceFramework,
                obj.source_version ?? newFile.sourceVersion
            );
            this.populateFrameworkObjectProperty(
                newObject.targetObject,
                obj.target_id,
                obj.target_text,
                obj.target_framework ?? newFile.targetFramework,
                obj.target_version ?? newFile.targetVersion
            );
            // Configure mapping type
            this.populateListItemProperty(
                newObject.mappingType, obj.mapping_type, mappingTypeIdToItemIdMap,
                mapping_type => ({
                    name        : `Undefined Mapping Type '${ mapping_type }'`,
                    description : `Undefined Mapping Type '${ mapping_type }'`,
                })
            )
            // Configure mapping group
            this.populateListItemProperty(
                newObject.mappingGroup, obj.mapping_group, mappingGroupIdToItemIdMap,
                mapping_group => ({ 
                    name : `Undefined Mapping Group '${ mapping_group }'`
                })
            )
            // Configure mapping status
            this.populateListItemProperty(
                newObject.mappingStatus, obj.mapping_status, mappingStatusIdToItemIdMap,
                mapping_status => ({ 
                    name : `Undefined Mapping Status '${ mapping_status }'`
                })
            )
            // Configure author
            newObject.author.value ??= file.author;
            newObject.authorContact.value ??= file.author_contact;
            // Configure references
            for(const url of obj.references) {
                newObject.references.insertListItem(
                    newObject.references.createNewItem({ url })
                )
            }
            // Configure comments
            newObject.comments.value = obj.comments;
            // Insert mapping object  
            newFile.insertMappingObject(newObject);
        }

        return newFile;

    }

    /**
     * Populates a {@link FrameworkObjectProperty} with a value.
     * @param prop
     *  The {@link FrameworkObjectProperty} to populate.
     * @param objId
     *  The framework object's id.
     * @param objText
     *  The framework object's text.
     * @param objFramework
     *  The framework object's framework.
     * @param objVersion
     *  The framework object's framework version.
     */
    private populateFrameworkObjectProperty (
        prop: FrameworkObjectProperty,
        objId: string | null,
        objText: string | null,
        objFramework: string,
        objVersion: string
    ) {
        // Attempt to load strict value
        if(prop instanceof StrictFrameworkObjectProperty) {
            this.populateStrictFrameworkObjectProperty(
                prop, objId, objText, objFramework, objVersion
            );
        }
        // Attempt to load dynamic value
        else if(prop instanceof DynamicFrameworkObjectProperty) {
            this.populateDynamicFrameworkObjectProperty(
                prop, objId, objText, objFramework, objVersion
            );
        }
        // Attempt to load free value
        else if(prop instanceof FreeFrameworkObjectProperty) {
            prop.forceSet(objId, objText, objFramework, objVersion);
        } else {
            throw new Error(`Cannot load framework object into type '${ prop.constructor.name }'.`);
        }
    }

    /**
     * Populates a {@link StrictFrameworkObjectProperty} with a value.
     * @param prop
     *  The {@link StrictFrameworkObjectProperty} to populate.
     * @param objId
     *  The framework object's id.
     * @param objText
     *  The framework object's text.
     * @param objFramework
     *  The framework object's framework.
     * @param objVersion
     *  The framework object's framework version.
     */
    private populateStrictFrameworkObjectProperty(
        prop: StrictFrameworkObjectProperty,
        objId: string | null,
        objText: string | null,
        objFramework: string,
        objVersion: string
    ) {
        const frameworkMatches = prop.framework.id === objFramework;
        const versionMatches = prop.framework.version === objVersion;
        if(frameworkMatches && versionMatches) {
            if(prop.framework.options.has(objId)) {
                const text = prop.framework.options.get(objId);
                if(text === objText) {
                    prop.objectId = objId;
                    return;
                }
            }
            objFramework = MappingsFileAuthority.UNKNOWN_FRAMEWORK_ID;
            objVersion = MappingsFileAuthority.UNKNOWN_FRAMEWORK_VERSION;
        }
        prop.forceSet(objId, objText, objFramework, objVersion);
    }

    /**
     * Populates a {@link DynamicFrameworkObjectProperty} with a value.
     * @param prop
     *  The {@link DynamicFrameworkObjectProperty} to populate.
     * @param objId
     *  The framework object's id.
     * @param objText
     *  The framework object's text.
     * @param objFramework
     *  The framework object's framework.
     * @param objVersion
     *  The framework object's framework version.
     */
    private populateDynamicFrameworkObjectProperty(
        prop: DynamicFrameworkObjectProperty,
        objId: string | null,
        objText: string | null,
        objFramework: string,
        objVersion: string
    ) {
        const frameworkMatches = prop.framework.id === objFramework;
        const versionMatches = prop.framework.version === objVersion;
        if(frameworkMatches && versionMatches) {
            if(prop.framework.options.has(objId)) {
                const text = prop.framework.options.get(objId);
                if(text === objText) {
                    prop.objectId = objId;
                } else {
                    objFramework = MappingsFileAuthority.UNKNOWN_FRAMEWORK_ID;
                    objVersion = MappingsFileAuthority.UNKNOWN_FRAMEWORK_VERSION
                    prop.forceSet(objId, objText, objFramework, objVersion);
                }
            } else {
                prop.objectId = objId;
                prop.objectText = objText;
            }
        } else {
            prop.forceSet(objId, objText, objFramework, objVersion);
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
     * @returns
     *  A Map that maps dictionary keys to {@link ListItem} ids. 
     */
    private populateListPropertyFromDictionary (
        prop: ListProperty,
        object: { [key: string]: any },
        defineItem: (key: string, value: any) => { [key: string]: any }
    ): Map<string | null, string> {
        const keyToItemIdMap = new Map<string | null, string>();
        for(const key in object) {
            const item = prop.createNewItem(defineItem(key, object[key]));
            prop.insertListItem(item);
            keyToItemIdMap.set(key, item.id);
        }
        return keyToItemIdMap;
    }

    /**
     * Populates a {@link ListItemProperty} with a value.
     * @param prop
     *  The {@link ListItemProperty} to populate.
     * @param exportValue
     *  The export value. 
     * @param exportValueToItemId
     *  A Map that maps export values to {@link ListItem} ids.
     * @param defineUnknownItem
     *  A function which accepts the export value and returns an object which
     *  defines a new list item (in the case where the specified export
     *  value is not a valid option).
     */
    private populateListItemProperty(
        prop: ListItemProperty,
        exportValue: string | null,
        exportValueToItemId: Map<string | null, string>,
        defineUnknownItem: (exportValue: string | null) => { [key: string]: any }
    ) {
        let itemId = exportValueToItemId.get(exportValue);
        if(!itemId) {
            const item = prop.options.createNewItem({
                ...defineUnknownItem(exportValue),
                [prop.exportValueKey]: exportValue,
            });
            exportValueToItemId.set(exportValue, item.id);
            prop.options.insertListItem(item);
            itemId = item.id;
        }
        prop.value = itemId;
    }
    

    ///////////////////////////////////////////////////////////////////////////
    //  3. Migrate Mapping File  //////////////////////////////////////////////
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
    //  4. Audit Mapping File  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////



    public auditMappingObject(object: MappingObject) {
        if(object.file === null) {
            throw new Error(`Mapping '${ object.id }' must be belong to a Mapping File to be audited.`)
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  5. Export Mapping File  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Exports a Mapping File to a plain JSON object.
     * @param file
     *  The Mapping File to export.
     * @returns
     *  The exported Mapping File.
     */
    public exportMappingsFile(file: MappingFile): MappingFileExport {
        
        // Compile mapping types list
        const mapping_types = new Map();
        this.deduplicateListProperty(file.mappingTypes, "id")
        for(const type of file.mappingTypes.value.values()) {
            mapping_types.set(
                type.getAsString("id"),
                { 
                    name        : type.getAsString("name"),
                    description : type.getAsString("description")
                }
            );
        }
        
        // Compile mapping groups list
        const mapping_groups = new Map();
        this.deduplicateListProperty(file.mappingGroups, "id");
        for(const type of file.mappingGroups.value.values()) {
            mapping_groups.set(
                type.getAsString("id"),
                type.getAsString("name")
            );
        }

        // Compile mapping status list
        const mapping_statuses = new Map();
        this.deduplicateListProperty(file.mappingStatuses, "id");
        for(const type of file.mappingStatuses.value.values()) {
            mapping_statuses.set(
                type.getAsString("id"),
                type.getAsString("name")
            );
        }
        
        // Compile mapping objects list
        const mapping_objects: MappingObjectExport[] = [];
        for(const object of file.mappingObjects.values()) {
            // Compile references
            const references = [...object.references.value.values()]
                .map(o => o.properties.get("url")!.toString())
            // Compile mapping object
            mapping_objects.push({
                source_id        : object.sourceObject.objectId,
                source_text      : object.sourceObject.objectText,
                source_version   : object.sourceObject.objectVersion,
                source_framework : object.sourceObject.objectFramework,
                target_id        : object.targetObject.objectId,
                target_text      : object.targetObject.objectText,
                target_version   : object.targetObject.objectVersion,
                target_framework : object.targetObject.objectFramework,
                mapping_type     : object.mappingType.exportValue,
                mapping_group    : object.mappingGroup.exportValue,
                mapping_status   : object.mappingStatus.exportValue,
                author           : object.author.value,
                author_contact   : object.authorContact.value,
                references,
                comments         : object.comments.value,
            });
        }
        
        // Compile file
        return {
            version               : file.version,
            source_framework      : file.sourceFramework,
            source_version        : file.sourceVersion,
            target_framework      : file.targetFramework,
            target_version        : file.targetVersion,
            author                : file.author.value,
            author_contact        : file.authorContact.value,
            author_organization   : file.authorOrganization.value,
            creation_date         : file.creationDate,
            modified_date         : file.modifiedDate,
            mapping_types         : Object.fromEntries(mapping_types),
            mapping_groups        : Object.fromEntries(mapping_groups),
            mapping_statuses      : Object.fromEntries(mapping_statuses),
            mapping_objects  
        }

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
            const subProp = type.properties.get(key);
            if(!subProp) {
                throw new Error(`No subproperty '${ key }'.`)
            } else if(subProp instanceof StringProperty) {
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
