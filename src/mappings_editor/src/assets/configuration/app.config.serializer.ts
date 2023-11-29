import { MappingFileSerializer } from "../scripts/Application";
import type { MappingFileExport } from "../scripts/MappingsFileAuthority";

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
            mapping_objects.push({
                comments: obj.comments,
                attack_object_id: obj.source_id,
                attack_object_name: obj.source_text,
                references: [],
                capability_description: obj.target_text,
                capability_id: obj.target_id,
                mapping_type: "",
                group: obj.group
            })
        }
        // Parse domain and version
        const [domain, version] = file.source_version.split(/@/);
        // Parse metadata
        const unifiedSchemaFile = {
            metadata: {
                mapping_version: "",
                attack_version: version,
                technology_domain: domain,
                author: file.author,
                contact: file.author_contact,
                creation_date: file.creation_date,
                last_update: file.modified_date,
                organizations: file.author_organization,
                mapping_framework: file.target_framework,
                mapping_framework_version: file.target_version,
                mapping_framework_schema: "",
                mappings_types: [],
                groups: [],
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
        const json = JSON.parse(file);
        // Parse Objects
        const mapping_objects = [];
        for(const obj of json.mapping_objects) {
            mapping_objects.push({
                source_id: obj.attack_object_id,
                source_text: obj.attack_object_name,
                source_version: obj.attack_object_version,
                source_framework: "mitre_attack",
                target_id: obj.capability_id,
                target_text: obj.capability_description,
                target_version: obj.capability_version,
                author: obj.author,
                author_contact: obj.contact,
                comments: obj.comments,
                group: obj.group
            });
        }
        // Parse File
        const meta = json.metadata;
        const mappingFileExport = { 
            source_framework: "mitre_attack",
            source_version: `${ meta.technology_domain }@${ meta.attack_version }`,
            target_framework: meta.mapping_framework,
            target_version: meta.mapping_framework_version,
            author: meta.author,
            author_contact: meta.contact,
            author_organization: meta.organization,
            creation_date: new Date(meta.creation_date),
            modified_date: new Date(meta.last_update),
            mapping_objects
        }
        return mappingFileExport;
    }

}
