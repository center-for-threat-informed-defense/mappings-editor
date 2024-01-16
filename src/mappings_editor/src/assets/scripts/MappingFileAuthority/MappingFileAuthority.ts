import { MappingFile } from "../MappingFile/MappingFile";
import type { FrameworkRegistry } from "./FrameworkRegistry";
import type { MappingFileExport, MappingObjectExport } from "./MappingFileExport";
import { 
    DynamicFrameworkObjectProperty, 
    EditableDynamicFrameworkListing, 
    EditableStrictFrameworkListing, 
    FrameworkObjectProperty,
    ListItem,
    ListItemProperty, 
    ListProperty, 
    MappingObject,
    StrictFrameworkObjectProperty,
    StringProperty,
} from "../MappingFile";
import { randomUUID } from "../Utilities";
import type { ApplicationStore } from '@/stores/ApplicationStore';
import { EditorCommand } from '../MappingFileEditor';

export class MappingFileAuthority {

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
    public async createEmptyMappingFile(file: MappingFileExport, id?: string) {

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
            creationDate       : file.creation_date ?? new Date(),
            modifiedDate       : file.modified_date ?? new Date(),
            mappingObjectTemplate
        }, id);

        // Load dictionaries into file lists
        const stringTransform 
            = (id: string, name: string) => ({ id, name });
        const objectTransform
            = (id: string, { name, description }: any) => ({ id, name, description });
        ([
            [mappingFile.mappingTypes, file.mapping_types, objectTransform],
            [mappingFile.mappingGroups, file.mapping_groups, stringTransform],
            [mappingFile.mappingStatuses, file.mapping_statuses, stringTransform],
            [mappingFile.scoreCategories, file.score_categories, stringTransform],
            [mappingFile.scoreValues, file.score_values, stringTransform]
        ] as [ListProperty, { [key: string]: any }, any][]).forEach(
            args => this.populateListPropertyFromDictionary(...args)
        );

        // Set default mapping status
        if((file.default_mapping_status ?? null) !== null) {
            const mappingStatus = mappingFile.mappingStatuses.findListItemId(
                o => o.getAsString("id") === file.default_mapping_status
            ) ?? null;
            mappingObjectTemplate.mappingStatus.value = mappingStatus;
        }

        // Set default mapping type
        if((file.default_mapping_type ?? null) !== null) {
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
        // Create new file
        const newFile = await this.createEmptyMappingFile(file, id);
        // Create list item id maps
        const [
            mappingTypeIdToItemIdMap,
            mappingGroupIdToItemIdMap,
            mappingStatusIdToItemIdMap,
            scoreCategoryIdToItemIdMap,
            scoreValuesIdToItemIdMap
        ] = [
            newFile.mappingTypes.value,
            newFile.mappingGroups.value,
            newFile.mappingStatuses.value,
            newFile.scoreCategories.value,
            newFile.scoreValues.value
        ].map(
            v => new Map([...v].map(([k, i]) => [i.getAsString("id"), k]))
        )
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
            // Configure author
            newObject.author.value ??= file.author;
            newObject.authorContact.value ??= file.author_contact;
            newObject.authorOrganization.value ??= file.author_organization;
            // Configure references
            for(const url of obj.references) {
                newObject.references.insertListItem(
                    newObject.references.createNewItem({ url })
                )
            }
            // Configure comments
            newObject.comments.value = obj.comments;
            // Configure mapping type
            this.populateListItemProperty(
                newObject.mappingType, obj.mapping_type, mappingTypeIdToItemIdMap,
                mapping_type => ({
                    name        : `Unknown Mapping Type '${ mapping_type }'`,
                    description : `Unknown Mapping Type '${ mapping_type }'`,
                })
            )
            // Configure mapping group
            this.populateListItemProperty(
                newObject.mappingGroup, obj.mapping_group, mappingGroupIdToItemIdMap,
                mapping_group => ({ 
                    name : `Unknown Mapping Group '${ mapping_group }'`
                })
            )
            // Configure mapping status
            this.populateListItemProperty(
                newObject.mappingStatus, obj.mapping_status, mappingStatusIdToItemIdMap,
                mapping_status => ({ 
                    name : `Unknown Mapping Status '${ mapping_status }'`
                })
            )
            // Configure score category
            this.populateListItemProperty(
                newObject.scoreCategory, obj.score_category, scoreCategoryIdToItemIdMap,
                score_category => ({ 
                    name : `Unknown Score Category '${ score_category }'`
                })
            );
            // Configure score value
            this.populateListItemProperty(
                newObject.scoreValue, obj.score_value, scoreValuesIdToItemIdMap,
                score_value => ({ 
                    name : `Unknown Score Value '${ score_value }'`
                })
            );
            // Configure related score
            if(newObject.targetObject.framework.options.has(obj.related_score)) {
                newObject.relatedScore.objectId = obj.related_score;
            } else {
                newObject.relatedScore.cacheObjectValue(obj.related_score, null);
            }
            // Add `imported` field if this is an imported mapping object 
            newObject.imported = obj.imported ? true : false;

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
            objFramework = MappingFileAuthority.UNKNOWN_FRAMEWORK_ID;
            objVersion = MappingFileAuthority.UNKNOWN_FRAMEWORK_VERSION;
        }
        prop.cacheObjectValue(objId, objText, objFramework, objVersion);
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
                    objFramework = MappingFileAuthority.UNKNOWN_FRAMEWORK_ID;
                    objVersion = MappingFileAuthority.UNKNOWN_FRAMEWORK_VERSION
                    prop.cacheObjectValue(objId, objText, objFramework, objVersion);
                }
            } else {
                prop.objectId = objId;
                prop.objectText = objText;
            }
        } else {
            prop.cacheObjectValue(objId, objText, objFramework, objVersion);
        }
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
        exportValueToItemId: Map<string, string>,
        defineUnknownItem: (exportValue: string | null) => { [key: string]: any }
    ) {
        let itemId;
        if(exportValue) {
            itemId = exportValueToItemId.get(exportValue);
            if(!itemId) {
                const item = prop.options.createNewItem({
                    ...defineUnknownItem(exportValue),
                    [prop.exportValueKey]: exportValue,
                });
                exportValueToItemId.set(exportValue, item.id);
                prop.options.insertListItem(item);
                itemId = item.id;
            }
        } else {
            itemId = null;
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
    //  4. Import Mapping File  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Exports the current MappingFileEditor to a MappingFileExport and the current imported Mapping file.
     * @param openedFile
     *  The current MappingFileEditor.
     * @param importedFile
     * The imported MappingFileExport
     * @returns
     *  The merged Mapping File.
     */
    public async importMappingFile(openedMappingFile: MappingFile, importedFile: MappingFileExport): Promise<MappingFile> {
        let openedFileExport = this.exportMappingFile(openedMappingFile)
        let mergeFile = await this.mergeFiles(openedFileExport, importedFile);
        return mergeFile;
    }
    
    /**
     * Adds the imported Mapping File's mapping_objects to the current Mapping File's mapping_objects
     * @param openedFile
     *  The current Mapping File as a MappingFileExport.
     * @param importedFile
     * The imported MappingFileExport
     * @returns
     *  The merged Mapping File.
     */
    public async mergeFiles(openedFile: MappingFileExport, importedFile: MappingFileExport): Promise<MappingFile> {
        // Throw error if the imported file's source framework does not match the current file's source framework
        if (openedFile.source_framework !== importedFile.source_framework || openedFile.target_framework !== importedFile.target_framework) {
            throw new Error(`The imported file's mapping framework must be the same as the active file's mapping framework.`)
        }
        // if versions do not match, explicitly set the imported file's mapping objects to the version
        if (openedFile.source_version !== importedFile.source_version) {
            importedFile.mapping_objects.forEach(mappingObject => {
                mappingObject.source_version = importedFile.source_version
            })
        }
        if (openedFile.target_version !== importedFile.target_version) {
            importedFile.mapping_objects.forEach(mappingObject => {
                mappingObject.target_version = importedFile.target_version
            })
        }
        // add imported file's metadata
        Object.entries(importedFile.mapping_types).forEach(([key, value]) => {
            !openedFile.mapping_types[key] && (openedFile.mapping_types[key] = value);
        })
        Object.entries(importedFile.mapping_groups).forEach(([key, value]) => {
            !openedFile.mapping_groups[key] && (openedFile.mapping_groups[key] = value);
        })
        // add imported field to mapping objects that were just imported
        importedFile.mapping_objects.forEach(mappingObject => {
            mappingObject.imported = true;
        })
        // add imported file's mapping objects to current file's mapping objects
        openedFile.mapping_objects.push(importedFile.mapping_objects);
        openedFile.mapping_objects = openedFile.mapping_objects.flat();
        return await this.loadMappingFile(openedFile)
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
    public exportMappingFile(file: MappingFile): MappingFileExport {
        
        // Convert list properties to maps
        const stringTransform 
            = (item: ListItem) => item.getAsString("name");
        const objectTransform
            = (item: ListItem) => ({ 
                name        : item.getAsString("name"),
                description : item.getAsString("description")
            });
        const argSets: [ListProperty, string, any][] = [
            [file.mappingTypes, "id", objectTransform],
            [file.mappingGroups, "id", stringTransform],
            [file.mappingStatuses, "id", stringTransform],
            [file.scoreCategories, "id", stringTransform],
            [file.scoreValues, "id", stringTransform]
        ];
        const [
            mapping_types,
            mapping_groups,
            mapping_statuses,
            score_categories,
            score_values
        ] = argSets.map(
            args => this.convertListPropertyToDictionary(...args)
        );

        // Compile mapping objects list
        const mapping_objects: MappingObjectExport[] = [];
        for(const object of file.mappingObjects.values()) {
            // Compile references
            const references = [...object.references.value.values()]
                .map(o => o.getAsString("url"))
            // Compile mapping object
            mapping_objects.push({
                source_id           : object.sourceObject.objectId,
                source_text         : object.sourceObject.objectText,
                source_version      : object.sourceObject.objectVersion,
                source_framework    : object.sourceObject.objectFramework,
                target_id           : object.targetObject.objectId,
                target_text         : object.targetObject.objectText,
                target_version      : object.targetObject.objectVersion,
                target_framework    : object.targetObject.objectFramework,
                author              : object.author.value,
                author_contact      : object.authorContact.value,
                author_organization : object.authorOrganization.value,
                references,
                comments            : object.comments.value,
                mapping_type        : object.mappingType.exportValue,
                mapping_group       : object.mappingGroup.exportValue,
                mapping_status      : object.mappingStatus.exportValue,
                score_category      : object.scoreCategory.exportValue,
                score_value         : object.scoreValue.exportValue,
                related_score       : object.relatedScore.objectId
            });
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
            mapping_types          : Object.fromEntries(mapping_types),
            mapping_groups         : Object.fromEntries(mapping_groups),
            mapping_statuses       : Object.fromEntries(mapping_statuses),
            score_categories       : Object.fromEntries(score_categories),
            score_values           : Object.fromEntries(score_values),
            mapping_objects
        }

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
