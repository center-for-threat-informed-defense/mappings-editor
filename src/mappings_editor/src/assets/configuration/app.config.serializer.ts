import { MappingFileSerializer } from "../scripts/Application";
import type { MappingFileExport } from "../scripts/MappingFileAuthority";

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
        const mapping_objects = [];
        for(const obj of file.mapping_objects) {
            const fsv = file.source_version,
                  ftv = file.target_version,
                  osv = obj.source_version,
                  otv = obj.target_version;
            mapping_objects.push({
                author                  : obj.author,
                contact                 : obj.author_contact,
                comments                : obj.comments,
                references              : obj.references,
                attack_object_id        : obj.target_id,
                attack_object_name      : obj.target_text,
                attack_object_version   : otv !== undefined && otv !== ftv ? otv : undefined,
                capability_id           : obj.source_id,
                capability_description  : obj.source_text,
                capability_version      : osv !== undefined && osv !== fsv ? osv : undefined,
                mapping_type            : obj.mapping_type,
                group                   : obj.mapping_group,
                status                  : obj.mapping_status
            });
        }
        // Parse domain and version
        const [attackDomain, attackVersion] = file.target_version.split(/@/);
        // Parse mapping types
        const mapping_types = Object.entries(file.mapping_types).map(
            ([id, obj]) => ({ id, ...obj })
        )
        // Parse mapping groups
        const groups = Object.entries(file.mapping_groups).map(
            ([id, name]) => ({ id, name })
        )
        // Parse metadata
        const unifiedSchemaFile: UniversalSchemaMappingFile = {
            metadata: {
                mapping_version                  : file.version,
                attack_version                   : attackVersion,
                technology_domain                : attackDomain,
                author                           : file.author,
                contact                          : file.author_contact,
                organization                     : file.author_organization,
                creation_date                    : file.creation_date.toString(),
                last_update                      : file.modified_date.toString(),
                mapping_framework                : file.source_framework,
                mapping_framework_version        : file.source_version,
                mapping_types,
                groups
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
        const mapping_objects = [];
        for(const obj of json.mapping_objects) {
            mapping_objects.push({
                source_id        : obj.capability_id,
                source_text      : obj.capability_description,
                source_version   : obj.capability_version,
                target_id        : obj.attack_object_id,
                target_text      : obj.attack_object_name,
                target_version   : obj.attack_object_version,
                mapping_type     : obj.mapping_type,
                mapping_group    : obj.group,
                mapping_status   : obj.status ?? "complete",
                author           : obj.author,
                author_contact   : obj.contact,
                references       : obj.references,
                comments         : obj.comments
            });
        }
        const meta = json.metadata;
        // Parse mapping types
        const mapping_types = Object.fromEntries(meta.mapping_types.map(
            ({id, name, description}) => [id, { name, description }]
        ));
        // Parse mapping groups
        const mapping_groups = Object.fromEntries(meta.groups.map(
            ({id, name}) => [id, name]
        ));
        // Define mapping statuses
        const mapping_statuses = {
            "complete"     : "Complete",
            "in_progress"  : "In Progress",
            "non_mappable" : "Non-Mappable"
        }
        // Parse metadata
        const mappingFileExport = { 
            version               : meta.mapping_version,
            source_framework      : meta.mapping_framework,
            source_version        : meta.mapping_framework_version,
            target_framework      : "mitre_attack",
            target_version        : `${ meta.technology_domain }@${ meta.attack_version }`,
            author                : meta.author,
            author_contact        : meta.contact,
            author_organization   : meta.organization,
            creation_date         : new Date(meta.creation_date),
            modified_date         : new Date(meta.last_update),
            mapping_types,
            mapping_groups,
            mapping_statuses,
            mapping_objects
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
            id: string,
            name: string,
            description: string
        }[],
        groups: { 
            id: string,
            name: string
        }[]
    },
    mapping_objects: {
        author: string | null,
        contact: string | null,
        comments: string | null,
        references: string[],
        attack_object_id: string | null,
        attack_object_name: string | null,
        attack_object_version?: string,
        capability_id: string | null,
        capability_description: string | null,
        capability_version?: string,
        mapping_type: string | null,
        group: string | null,
        status: string | null
    }[]
}
