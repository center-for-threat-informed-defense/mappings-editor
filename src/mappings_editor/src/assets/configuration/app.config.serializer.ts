import { MappingFileSerializer } from "../scripts/Application";
import type { MappingFileExport, MappingObjectExport } from "../scripts/MappingFileAuthority";

export class UniversalSchemaMappingFileSerializer extends MappingFileSerializer {

    /**
     * Creates a new {@link UniversalSchemaMappingFileSerializer}.
     */
    constructor() {
        super();
    }


    /**
     * Serializes a {@link MappingFileExport} to a string. 
     * @param file
     *  The file to serialize.
     */
    public serialize(file: MappingFileExport): string {
        // Parse mapping objects
        const mapping_objects: UniversalSchemaMappingObject[] = [];
        for(const obj of file.mapping_objects) {
            const fsv = file.source_version,
                  ftv = file.target_version,
                  osv = obj.source_version,
                  otv = obj.target_version;
            mapping_objects.push({
                author                  : obj.author ?? undefined,
                contact                 : obj.author_contact ?? undefined,
                comments                : obj.comments ?? undefined,
                references              : obj.references,
                attack_object_id        : obj.target_id,
                attack_object_name      : obj.target_text,
                attack_object_version   : otv !== null && otv !== ftv ? otv : undefined,
                capability_id           : obj.source_id,
                capability_description  : obj.source_text,
                capability_version      : osv !== null && osv !== fsv ? osv : undefined,
                mapping_type            : obj.mapping_type,
                score_category          : obj.score_category ?? undefined,
                score_value             : obj.score_value ?? undefined,
                related_score           : obj.related_score ?? undefined,
                group                   : obj.mapping_group ?? undefined,
                status                  : obj.mapping_status ?? undefined
            });
        }
        // Parse domain and version
        const [attackDomain, attackVersion] = file.target_version.split(/@/);
        // Parse metadata
        const unifiedSchemaFile: UniversalSchemaMappingFile = {
            metadata: {
                mapping_version                  : file.version,
                attack_version                   : attackVersion,
                technology_domain                : attackDomain,
                author                           : file.author,
                contact                          : file.author_contact,
                organization                     : file.author_organization,
                creation_date                    : file.creation_date.toLocaleDateString('es-pa'),
                last_update                      : file.modified_date.toLocaleDateString('es-pa'),
                mapping_framework                : file.source_framework,
                mapping_framework_version        : file.source_version,
                mapping_types                    : file.mapping_types,
                groups                           : file.mapping_groups
            },
            mapping_objects
        }
        return JSON.stringify(unifiedSchemaFile, null, 4);
    }
    
    /**
     * Deserializes a string to a {@link MappingFileExport}. 
     * @param file
     *  The file to deserialize.
     */
    public deserialize(file: string): MappingFileExport {
        const json = JSON.parse(file) as UniversalSchemaMappingFile;
        // Parse mapping objects
        const mapping_objects: MappingObjectExport[] = [];
        for(const obj of json.mapping_objects) {
            mapping_objects.push({
                source_id           : obj.capability_id,
                source_text         : obj.capability_description,
                source_version      : obj.capability_version ?? null,
                source_framework    : null,
                target_id           : obj.attack_object_id,
                target_text         : obj.attack_object_name,
                target_version      : obj.attack_object_version ?? null,
                target_framework    : null,
                author              : obj.author ?? null,
                author_contact      : obj.contact ?? null,
                author_organization : null,
                references          : obj.references,
                comments            : obj.comments ?? null,
                mapping_type        : obj.mapping_type,
                mapping_group       : obj.group ?? null,
                mapping_status      : obj.status ?? "in_progress",
                score_category      : obj.score_category ?? null,
                score_value         : obj.score_value ?? null,
                related_score       : obj.related_score ?? null
            });
        }
        const meta = json.metadata;
        // Define mapping statuses
        const mapping_statuses = {
            "complete"     : "Complete",
            "in_progress"  : "In Progress",
            "non_mappable" : "Non-Mappable"
        };
        // Define score categories
        const score_categories = {
            "protect"      : "Protect",
            "detect"       : "Detect",
            "respond"      : "Respond"
        };
        // Define score values
        const score_values = {
            "minimal"      : "Minimal",
            "partial"      : "Partial",
            "significant"  : "Significant"
        };
        // Define default mapping status
        const default_mapping_status = "in_progress";
        // Define default mapping type
        const types = Object.keys(meta.mapping_types);
        const default_mapping_type = types.length === 1 ? types[0] : undefined;
        // Parse metadata
        const mappingFileExport = { 
            version                : meta.mapping_version,
            source_framework       : meta.mapping_framework,
            source_version         : meta.mapping_framework_version,
            target_framework       : "mitre_attack",
            target_version         : `${ meta.technology_domain }@${ meta.attack_version }`,
            author                 : meta.author,
            author_contact         : meta.contact,
            author_organization    : meta.organization,
            creation_date          : new Date(meta.creation_date),
            modified_date          : new Date(meta.last_update),
            mapping_types          : meta.mapping_types,
            mapping_groups         : meta.groups,
            mapping_statuses,
            score_categories,
            score_values,
            mapping_objects,
            default_mapping_status,
            default_mapping_type
        }
        return mappingFileExport;
    }

}

/**
 * The Universal Schema Mapping File Format
 */
type UniversalSchemaMappingFile = {
    metadata: {
        mapping_version: string,
        attack_version: string,
        technology_domain: string,
        mapping_framework: string,
        mapping_framework_version: string,
        author: string | null,
        contact: string | null,
        organization: string | null,
        creation_date: string,
        last_update: string,
        mapping_types: {
            [key: string]: { name: string, description: string }   
        },
        groups: { [key: string]: string }
    },
    mapping_objects: UniversalSchemaMappingObject[]
}

/**
 * The Universal Schema Mapping Object Format
 */
type UniversalSchemaMappingObject = {
    author?: string,
    contact?: string,
    comments?: string,
    references: string[],
    attack_object_id: string | null,
    attack_object_name: string | null,
    attack_object_version?: string,
    capability_id: string | null,
    capability_description: string | null,
    capability_version?: string,
    mapping_type: string | null,
    score_category?: string,
    score_value?: string,
    related_score?: string,
    group?: string,
    status?: string
}