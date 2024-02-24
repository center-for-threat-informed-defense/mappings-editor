import { MappingFileSerializer, type TextualObject } from "../scripts/Application";
import type { MappingFileExport, MappingObjectExport } from "../scripts/MappingFileAuthority";

export class UniversalSchemaMappingFileSerializer extends MappingFileSerializer {

    /**
     * Creates a new {@link UniversalSchemaMappingFileSerializer}.
     */
    constructor() {
        super();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Serialization  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Serializes a {@link MappingFileExport} to a string. 
     * @param file
     *  The file to serialize.
     */
    public serialize(file: MappingFileExport): string {
        return JSON.stringify(this.toUniversalMappingFile(file), null, 4);
    }

    /**
     * Serializes a list of {@link MappingObjectExport}s to the clipboard.
     * @param objects
     *  The objects to serialize.
     * @returns
     *  The serialized {@link MappingObjectExport}s.
     */
    public processCopy(objects: MappingObjectExport[]): string {
        return this.objectsToCsv(objects.map(o => this.toUniversalMappingObject(o)), "\t");
    }

    /**
     * Converts {@link MappingFileExport} to a
     * {@link UniversalSchemaMappingFile}.
     * @param file
     *  The mapping file export.
     * @returns
     *  The universal schema mapping file.
     */
    private toUniversalMappingFile(
        file: MappingFileExport
    ): UniversalSchemaMappingFile {
        // Parse mapping objects
        const mapping_objects = file.mapping_objects.map(
            o => this.toUniversalMappingObject(o, file)
        );
        // Parse mapping file
        const domain = /mitre_attack_(.*)/i.exec(file.target_framework);
        const unifiedSchemaFile: UniversalSchemaMappingFile = {
            metadata: {
                mapping_version           : file.version,
                technology_domain         : domain !== null ? domain[1] : file.target_framework,
                attack_version            : file.target_version,
                mapping_framework         : file.source_framework,
                mapping_framework_version : file.source_version,
                author                    : file.author,
                contact                   : file.author_contact,
                organization              : file.author_organization,
                creation_date             : file.creation_date.toLocaleDateString("es-pa"),
                last_update               : file.modified_date.toLocaleDateString("es-pa"),
                mapping_types             : file.mapping_types,
                capability_groups         : file.capability_groups
            },
            mapping_objects
        }
        return unifiedSchemaFile;
    }

    /**
     * Converts a {@link MappingObjectExport} to a
     * {@link UniversalSchemaMappingObject}.
     * @remarks
     *  By specifying a `file`, certain keys will be omitted from the mapping
     *  object because they are assumed to already be defined at the mapping
     *  file level. (e.g. `author`, `author_contact`, etc.)
     * @param obj
     *  The mapping object export.
     * @param file
     *  The mapping object's file export.
     * @returns
     *  The universal schema mapping object.
     */
    private toUniversalMappingObject(
        obj: MappingObjectExport,
        file?: MappingFileExport
    ): UniversalSchemaMappingObject {
        // Compress object export
        const exp = super.compressObjectExport(obj, file);
        // Compute technology domain
        let target_framework = exp.target_framework;
        if(target_framework) {
            const match = /mitre_attack_(.*)/i.exec(target_framework);
            target_framework = match !== null ? match[1] : target_framework;
        }
        // Return universal schema object
        return {
            capability_id             : exp.source_id,
            capability_description    : exp.source_text,
            mapping_framework         : exp.source_framework,
            mapping_framework_version : exp.source_version,
            attack_object_id          : exp.target_id,
            attack_object_name        : exp.target_text,
            technology_domain         : target_framework,
            attack_version            : exp.target_version,
            author                    : exp.author,
            contact                   : exp.author_contact,
            references                : exp.references,
            comments                  : exp.comments,
            capability_group          : exp.capability_group,
            mapping_type              : exp.mapping_type,
            status                    : exp.mapping_status,
            score_category            : exp.score_category,
            score_value               : exp.score_value,
            related_score             : this.computeRelatedScore(obj)
        }
    }

    /**
     * Computes a {@link MappingObjectExport}'s related score.
     * @param obj
     *  The mapping object export.
     * @returns
     *  The related score (if the object has one).
     */
    private computeRelatedScore(obj: MappingObjectExport): string | undefined {
        const hasScore = (obj.score_value ?? obj.score_category) !== null;
        const technique = /(T[0-9]{4})\.[0-9]{3}/i.exec(obj.target_id ?? "");
        if(hasScore && technique) {
            return technique[1];
        } else {
            return undefined;
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  2. Deserialization  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Deserializes a string to a {@link MappingFileExport}. 
     * @param file
     *  The file to deserialize.
     */
    public deserialize(file: string): MappingFileExport {
        const json = JSON.parse(file) as UniversalSchemaMappingFile;
        // Parse mapping file
        const meta = json.metadata;
        const types = Object.keys(meta.mapping_types);
        const mappingFileExport: MappingFileExport = { 
            version                : meta.mapping_version,
            source_framework       : meta.mapping_framework,
            source_version         : meta.mapping_framework_version,
            target_framework       : `mitre_attack_${ meta.technology_domain }`,
            target_version         : meta.attack_version,
            author                 : meta.author || null,
            author_contact         : meta.contact || null,
            author_organization    : meta.organization || null,
            creation_date          : new Date(meta.creation_date || Date.now()),
            modified_date          : new Date(meta.last_update || Date.now()),
            capability_groups      : meta.capability_groups,
            mapping_types          : meta.mapping_types,
            mapping_statuses: {
                "complete"         : "Complete",
                "in_progress"      : "In Progress",
                "non_mappable"     : "Non-Mappable"
            },
            score_categories: {
                "protect"          : "Protect",
                "detect"           : "Detect",
                "respond"          : "Respond"
            },
            score_values: {
                "minimal"          : "Minimal",
                "partial"          : "Partial",
                "significant"      : "Significant"
            },
            mapping_objects        : new Array(json.mapping_objects?.length),
            default_mapping_status : "in_progress",
            default_mapping_type   : types.length === 1 ? types[0] : null
        }
        // Parse mapping objects
        for(let i = 0; i < (json.mapping_objects?.length ?? 0); i++) {
            const obj = json.mapping_objects![i];
            const exp = this.toMappingObjectExport(obj, mappingFileExport);
            mappingFileExport.mapping_objects[i] = exp;
        }
        // Return mapping file
        return mappingFileExport;
    }

    /**
     * Deserializes a list of {@link MappingFileExport}s from the clipboard.
     * @param str
     *  The objects to deserialize.
     * @param file
     *  The file being pasted into.
     * @returns
     *  The deserialized {@link MappingFileExport}s.
     */
    public processPaste(str: string, file: MappingFileExport): MappingObjectExport[] {
        const objects = this.csvToObjects<Partial<UniversalSchemaMappingObject>>(str);
        if(objects.length === 0) {
            return [];
        }
        // Process objects
        const exports = new Array<MappingObjectExport>(objects.length);
        for(let i = 0; i < objects.length; i++) {
            exports[i] = this.toMappingObjectExport(objects[i], file);
        }
        return exports;
    }
    
    /**
     * Converts a {@link UniversalSchemaMappingFile} to a
     * {@link MappingObjectExport}.
     * @remarks
     *  By specifying a `file`, certain keys that have been omitted from the
     *  mapping object may be reintroduced using the values defined at the
     *  mapping file level. (e.g. `author`, `author_contact`, etc.)
     * @param obj
     *  The universal schema mapping object.
     * @param file
     *  The mapping object's universal schema file.
     * @returns
     *  The mapping object export.
     */
    private toMappingObjectExport(
        obj: Partial<UniversalSchemaMappingObject>,
        file?: MappingFileExport
    ): MappingObjectExport {
        // Compute technology domain
        let target_framework = obj.technology_domain
        if(target_framework) {
            target_framework = `mitre_attack_${ target_framework }`;
        }
        // Return mapping object
        return super.decompressMappingObject({
            source_id           : obj.capability_id,
            source_text         : obj.capability_description,
            source_framework    : obj.mapping_framework,
            source_version      : obj.mapping_framework_version,
            target_id           : obj.attack_object_id,
            target_text         : obj.attack_object_name,
            target_framework    : target_framework,
            target_version      : obj.attack_version,
            author              : obj.author,
            author_contact      : obj.contact,
            author_organization : undefined,
            references          : obj.references,
            comments            : obj.comments,
            capability_group    : obj.capability_group,
            mapping_type        : obj.mapping_type,
            mapping_status      : obj.status,
            score_category      : obj.score_category,
            score_value         : obj.score_value
        }, file);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Export  ////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * Converts a {@link MappingFileExport} to a list of objects.
     * @param file
     *  The mapping file.
     * @returns
     *  The mapping file represented as a list of objects.
     */
    protected fileToObjects(file: MappingFileExport): TextualObject[] {
        const objects = [];
        for(const exp of file.mapping_objects!) {
            const obj = this.toUniversalMappingObject(exp);
            objects.push({
                capability_id             : obj.capability_id,
                capability_description    : obj.capability_description,
                mapping_type              : this.getListItemName(file.mapping_types, obj.mapping_type),
                attack_object_id          : obj.attack_object_id,
                attack_object_name        : obj.attack_object_name,
                capability_group          : this.getListItemName(file.capability_groups, obj.capability_group),
                score_category            : this.getListItemName(file.score_categories, obj.score_category),
                score_value               : this.getListItemName(file.score_values, obj.score_value),
                related_score             : obj.related_score,
                comments                  : obj.comments,
                references                : obj.references,
                author                    : obj.author,
                mapping_framework         : obj.mapping_framework,
                mapping_framework_version : obj.mapping_framework_version,
                technology_domain         : obj.technology_domain,
                attack_version            : obj.attack_version,
                creation_date             : file.creation_date,
                last_update               : file.modified_date
            })
        }
        return objects;
    }

}

/**
 * The Universal Schema Mapping File Format
 */
type UniversalSchemaMappingFile = {
    metadata: {
        mapping_version           : string,
        attack_version            : string,
        technology_domain         : string,
        mapping_framework         : string,
        mapping_framework_version : string,
        author?                   : string | null,
        contact?                  : string | null,
        organization?             : string | null,
        creation_date?            : string,
        last_update?              : string,
        mapping_types             : UniversalSchemaMappingTypes,
        capability_groups         : UniversalSchemaCapabilityGroups
    },
    mapping_objects?              : UniversalSchemaMappingObject[]
}

/**
 * The Universal Schema Capability Groups.
 */
type UniversalSchemaCapabilityGroups = {
    [key: string] : string
}

/**
 * The Universal Schema Mapping Types
 */
type UniversalSchemaMappingTypes = {
    [key: string]: { 
        name        : string,
        description : string
    }   
}

/**
 * The Universal Schema Mapping Object Format
 */
type UniversalSchemaMappingObject = {
    attack_object_id                      : string | null,
    attack_object_name                    : string | null,
    technology_domain?                    : string,
    attack_version?                       : string,
    capability_id                         : string | null,
    capability_description                : string | null,
    mapping_framework?                    : string,
    mapping_framework_version?            : string,
    author?                               : string,
    contact?                              : string,
    references                            : string | string[],
    comments?                             : string,
    mapping_type                          : string | null,
    capability_group?                     : string,
    status?                               : string
    score_category?                       : string,
    score_value?                          : string,
    related_score?                        : string,
}
