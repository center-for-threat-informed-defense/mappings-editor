import { Reactivity, type MappingFileImport, type MappingObjectImport } from ".";
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
    type MappingObjectParameters,
} from "../MappingFile";
import type { FrameworkMigration, FrameworkRegistry } from "./FrameworkRegistry";
import type { MappingFileExport, MappingObjectExport } from "./MappingFileExport";
import type { MappingObjectProblem } from "../MappingFile/MappingObjectProblem";

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
    public async createEmptyMappingFile(file: MappingFileImport, id?: string): Promise<MappingFile> {

        const sf = file.source_framework,
              sv = file.source_version,
              tf = file.target_framework,
              tv = file.target_version

        // Validate source and target version
        if(!(sf && sv && tf && tv)) {
            throw new Error("Mapping File does not define source and target frameworks.");
        }

        // Create template mapping object
        const mappingObjectTemplate = new MappingObject({
            sourceObject       : await this.createFrameworkObjectProp(sf, sv),
            targetObject       : await this.createFrameworkObjectProp(tf, tv),
            author             : new StringProperty("Author", file.author || null),
            authorContact      : new StringProperty("Author E-mail", file.author_contact || null),
            authorOrganization : new StringProperty("Author Organization", file.author_organization || null),
            problems           : []
        });

        // Create mapping file
        const now = Date.now();
        const mappingFile = new MappingFile({
            fileId             : id,
            creationDate       : new Date(file.creation_date ?? now),
            modifiedDate       : new Date(file.modified_date ?? now),
            mappingObjectTemplate
        });

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
            for(const object of framework.frameworkObjects){
                listing.registerObject(object.id, object.name);
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
     * Loads a Mapping File import.
     * @param file
     *  The exported file.
     * @param id
     *  The file's id.
     * @returns
     *  The loaded Mapping File.
     */
    public async loadMappingFile(file: MappingFileImport, id?: string): Promise<MappingFile> {
        const rawThis = Reactivity.toRaw(this);
        // Create new file
        const newFile = await rawThis.createEmptyMappingFile(file, id);
        // Load mapping objects into file
        for(const obj of file.mapping_objects ?? []) {
            const newObject = newFile.createMappingObject(
                this.convertMappingObjectImportToParams(obj)
            );
            newFile.insertMappingObject(newObject);
        }
        return newFile;
    }

    /**
     * Converts a mapping object import to a set of mapping object parameters.
     * @param obj
     *  The {@link MappingObjectImport}.
     * @returns
     *  The converted {@link MappingObjectParameters}.
     */
    public convertMappingObjectImportToParams(obj: MappingObjectImport): MappingObjectParameters {
        return {
            sourceId           : obj.source_id,
            sourceText         : obj.source_text,
            sourceVersion      : obj.source_version,
            sourceFramework    : obj.source_framework,
            targetId           : obj.target_id,
            targetText         : obj.target_text,
            targetVersion      : obj.target_version,
            targetFramework    : obj.target_framework,
            author             : obj.author,
            authorContact      : obj.author_contact,
            authorOrganization : obj.author_organization,
            references         : obj.references,
            comments           : obj.comments,
            capabilityGroup    : obj.capability_group,
            mappingType        : obj.mapping_type,
            mappingStatus      : obj.mapping_status,
            scoreCategory      : obj.score_category,
            scoreValue         : obj.score_value
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //  4. Reload Mapping File  ///////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Reloads an existing Mapping File.
     * @remarks
     *  Reloading a Mapping File can be useful when you want an existing
     *  Mapping File to take advantage of a newly registered framework.
     * @param file
     *  The existing Mapping File.
     * @returns
     *  The reloaded Mapping File.
     */
    public async reloadMappingFile(file: MappingFile): Promise<MappingFile> {
        const rawThis = Reactivity.toRaw(this);
        // Serialize file
        const fileExport = this.exportMappingFile(file);
        // Create new file
        const newFile = await rawThis.createEmptyMappingFile({
            ...fileExport,
            creation_date: fileExport.creation_date.toISOString(),
            modified_date: fileExport.modified_date.toISOString()
        }, file.id);
        // Load mapping objects into file
        for(const obj of fileExport.mapping_objects ?? []) {
            const newObject = newFile.createMappingObject(
                this.convertMappingObjectImportToParams(obj)
            );
            newFile.insertMappingObject(newObject);
        }
        return newFile;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Migrate Mapping File  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Migrates an existing Mapping File to a new Mapping File.
     * @param file
     *  The existing Mapping File.
     * @returns
     *  The migrated Mapping File.
     */
    public async migrateMappingFile(file: MappingFile): Promise<MappingFile> {
        return file;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  6. Audit Mapping File  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    public auditMappingObject(object: MappingObject, frameworkMigration: FrameworkMigration) {
        if(object.file === null) {
            throw new Error(`Mapping '${ object.id }' must be belong to a Mapping File to be audited.`)
        }
        // see if id is in the migration context, if it is then add a problem associated with the migration change
        const problems: MappingObjectProblem[] = [];
        const id = object.targetObject.objectId;
        if (id) {
            const descriptionChange = frameworkMigration.changed_descriptions.get(id);
            if (descriptionChange) {
                problems.push({
                    problemType: "technique_description",
                    oldVersion: descriptionChange[0],
                    newVersion: descriptionChange[1]
                })
            }
            const nameChange = frameworkMigration.changed_names.get(id);
            if (nameChange) {
                problems.push({
                    problemType: "technique_name",
                    oldVersion: nameChange[0],
                    newVersion: nameChange[1]
                })
            }
            const techniqueRemoved = frameworkMigration.removed_framework_objects.find(i => i.id === id);
            if (techniqueRemoved) {
                problems.push({
                    problemType: "technique_removed",
                    oldVersion: techniqueRemoved,
                    newVersion: undefined
                })
            }
            const newMitigations = frameworkMigration.added_mitigations.get(id);
            newMitigations?.forEach(i =>
                problems.push({
                    problemType: "mitigation_new",
                    oldVersion: undefined,
                    newVersion: i
                })
            )
            const deletedMitigations = frameworkMigration.removed_mitigations.get(id);
            deletedMitigations?.forEach(i =>
                problems.push({
                    problemType: "mitigation_deleted",
                    oldVersion: i,
                    newVersion: undefined
                })
            )
            const newDetections = frameworkMigration.added_detections.get(id);
            newDetections?.forEach(i =>
                problems.push({
                    problemType: "detection_new",
                    oldVersion: undefined,
                    newVersion: i
                })
            )
            const deletedDetections = frameworkMigration.removed_detections.get(id);
            deletedDetections?.forEach(i =>
                problems.push({
                    problemType: "detection_deleted",
                    oldVersion: i,
                    newVersion: undefined
                })
            )
        }
        object.problems = problems;
        // update object status to version_changed if there's problems from migration context
        if (problems.length > 0) {
            object.mappingStatus.setValue("version_changed", "Version Change Detected");
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  7. Merge Mapping Files ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Merges multiple {@link MappingFileImport}s together.
     * @param files
     *  The {@link MappingFileImport}s to merge.
     * @returns
     *  The merged file imports
     */
    public mergeMappingFileImports(files: MappingFileImport[]): MappingFileImport {
        type ObjectKeys = KeysOfType<MappingFileImport, object>;
        type KeysOfType<T,V> = keyof { [ P in keyof T as T[P] extends V ? P : never ] : P };

        // Validate files
        if(files.length === 0) {
            throw new Error("No imports provided.");
        }
        if(files.length === 1) {
            return files[0]
        }

        // Merge files
        const listProperties: ObjectKeys[] = [
            "capability_groups",
            "mapping_statuses",
            "mapping_types",
            "score_categories",
            "score_values"
        ]
        const target = files[0];
        for(let i = 1; i < files.length; i++) {
            const file = files[i];
            // Validate frameworks
            if(target.source_framework !== file.source_framework) {
                throw new Error("All files must belong to the same source framework.");
            }
            if(target.target_framework !== file.target_framework) {
                throw new Error("All files must belong to the same target framework.");
            }
            // Merge objects
            if(!target.mapping_objects) {
                target.mapping_objects = file.mapping_objects;
            } else if(file.mapping_objects) {
                target.mapping_objects.push(...file.mapping_objects)
            }
            // Merge lists
            for(const list of listProperties){
                const src = file[list];
                const dst = target[list];
                for(const key in src) {
                    if(key in dst) {
                       continue;
                    }
                    dst[key] = src[key];
                }
            }
        }

        // Return merged file
        return files[0];

    }


    ///////////////////////////////////////////////////////////////////////////
    //  8. Export Mapping File  ///////////////////////////////////////////////
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
        const defaultObject = file.mappingObjectTemplate;
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
            default_mapping_type   : defaultObject.mappingType.exportValue,
            default_mapping_status : defaultObject.mappingStatus.exportValue
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
