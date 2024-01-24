import { MappingFileSerializer } from "../scripts/Application";
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
        // Parse mapping objects
        const mapping_objects = file.mapping_objects.map(
            o => this.toUniversalMappingObject(o, file)
        );
        // Parse mapping file
        const unifiedSchemaFile: UniversalSchemaMappingFile = {
            metadata: {
                mapping_version           : file.version,
                technology_domain         : /mitre_attack_(.*)/i.exec(file.target_framework)![1],
                attack_version            : file.target_version,
                mapping_framework         : file.source_framework,
                mapping_framework_version : file.source_version,
                author                    : file.author,
                contact                   : file.author_contact,
                organization              : file.author_organization,
                creation_date             : file.creation_date.toString(),
                last_update               : file.modified_date.toString(),
                mapping_types             : file.mapping_types,
                groups                    : file.mapping_groups
            },
            mapping_objects
        }
        return JSON.stringify(unifiedSchemaFile, null, 4);
    }

    /**
     * Serializes a list of {@link MappingObjectExport}s to the clipboard.
     * @param objects
     *  The objects to serialize.
     * @returns
     *  The serialized {@link MappingObjectExport}s.
     */
    public processCopy(objects: MappingObjectExport[]): string {
        // Convert objects
        const objs = objects.map(o => this.toUniversalMappingObject(o));
        // Serialize to CSV
        if(objs.length === 0) {
            return "";
        }
        type keys = (keyof UniversalSchemaMappingObject)[];
        const header = Object.keys(objs[0]) as keys;
        return [
            header.map(t => this.keyToTitleCase(t)).join("\t"),
            ...objs.map(o => header.map(k => o[k]).join("\t"))
        ].join("\r\n");
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
        return {
            capability_id             : obj.source_id,
            capability_description    : obj.source_text,
            mapping_framework         : this.maskValue(file, obj, "source_framework"),
            mapping_framework_version : this.maskValue(file, obj, "source_version"),
            attack_object_id          : obj.target_id,
            attack_object_name        : obj.target_text,
            technology_domain         : this.maskValue(file, obj, "target_framework"),
            attack_version            : this.maskValue(file, obj, "target_version"),
            author                    : this.maskValue(file, obj, "author"),
            contact                   : this.maskValue(file, obj, "author_contact"),
            references                : obj.references,
            comments                  : obj.comments       ?? undefined,
            mapping_type              : obj.mapping_type,
            group                     : obj.mapping_group  ?? undefined,
            status                    : obj.mapping_status ?? undefined,
            score_category            : obj.score_category ?? undefined,
            score_value               : obj.score_value    ?? undefined,
            related_score             : (/T[0-9]{4}/i.exec(obj.target_id ?? "") ?? [undefined])[0]
        }
    }

    /**
     * Returns the value of the specified {@link MappingObjectExport} key if
     * the value differs from the {@link MappingFileExport}.  
     * @param file
     *  The {@link MappingFileExport}.
     * @param obj
     *  The {@link MappingObjectExport}.
     * @param key
     *  The value's key.
     * @returns
     *  The value.
     */
    private maskValue(
        file: MappingFileExport | undefined,
        obj: MappingObjectExport,
        key: DuplicatedExportKey
    ): string | undefined {
        if(!file || file[key] !== obj[key]) {
            let match;
            switch(key) {
                case "target_framework":
                    match = /mitre_attack_(.*)/i.exec(obj[key]);
                    return match !== null ? match[1] : obj[key];
                default:
                    return obj[key] ?? undefined;
            }
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
        // Parse mapping objects
        const mapping_objects = json.mapping_objects.map(
            o => this.toMappingObjectExport(o, json)
        );
        // Parse mapping file
        const meta = json.metadata;
        const types = Object.keys(meta.mapping_types);
        return { 
            version                : meta.mapping_version,
            source_framework       : meta.mapping_framework,
            source_version         : meta.mapping_framework_version,
            target_framework       : `mitre_attack_${ meta.technology_domain }`,
            target_version         : meta.attack_version,
            author                 : meta.author,
            author_contact         : meta.contact,
            author_organization    : meta.organization,
            creation_date          : new Date(meta.creation_date),
            modified_date          : new Date(meta.last_update),
            mapping_types          : meta.mapping_types,
            mapping_groups         : meta.groups,
            mapping_statuses: {
                "complete"             : "Complete",
                "in_progress"          : "In Progress",
                "non_mappable"         : "Non-Mappable",
                "Assigned"             : "Assigned",
                "New Mitigations"      : "New Mitigations",
                "Dropped Mitigations"  : "Dropped Mitigations",
                "New Detections"       : "New Detections",
                "Modified Description" : "Modified Description",
                "New Techniques"       : "New Techniques"
            },
            score_categories: {
                "protect"      : "Protect",
                "detect"       : "Detect",
                "respond"      : "Respond"
            },
            score_values: {
                "minimal"      : "Minimal",
                "partial"      : "Partial",
                "significant"  : "Significant"
            },
            mapping_objects,
            default_mapping_status : "in_progress",
            default_mapping_type   : types.length === 1 ? types[0] : undefined
        }
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
        const objs: Partial<UniversalSchemaMappingObject>[] = [];
        // Deserialize from CSV 
        const lines = str.split(/\r?\n/).map(l => l.split(/\t/));
        if(2 <= lines.length) {
            const header = lines[0];
            for(let i = 1; i < lines.length; i++) {
                const obj = [];
                for(let j = 0; j < header.length; j++) {
                    obj.push([
                        this.toKey(header[j]),
                        lines[i][j] || undefined
                    ])
                }
                objs.push(Object.fromEntries(obj));
            }
        }
        // Convert file
        const usf = JSON.parse(this.serialize(file)) as UniversalSchemaMappingFile;
        // Convert objects
        return objs.map(o => this.toMappingObjectExport(o, usf));
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
        file?: UniversalSchemaMappingFile
    ): MappingObjectExport {
        // Return object
        return {
            source_id           : obj.capability_id          ?? null,
            source_text         : obj.capability_description ?? null,
            source_framework    : this.resolveValue(file, obj, "mapping_framework"),
            source_version      : this.resolveValue(file, obj, "mapping_framework_version"),
            target_id           : obj.attack_object_id       ?? null,
            target_text         : obj.attack_object_name     ?? null,
            target_framework    : this.resolveValue(file, obj, "technology_domain"),
            target_version      : this.resolveValue(file, obj, "attack_version"),
            author              : this.resolveValue(file, obj, "author", null),
            author_contact      : this.resolveValue(file, obj, "contact", null),
            author_organization : null,
            references          : obj.references             ?? [],
            comments            : obj.comments               ?? null,
            mapping_type        : obj.mapping_type           ?? null,
            mapping_group       : obj.group                  ?? null,
            mapping_status      : obj.status                 ?? "in_progress",
            score_category      : obj.score_category         ?? null,
            score_value         : obj.score_value            ?? null
        }
    }

    /**
     * Returns the value of the specified {@link UniversalSchemaMappingObject}
     * key. If the value isn't defined on the mapping object, the value is
     * resolved from a {@link UniversalSchemaMappingFile} instead.  
     * @param file
     *  The {@link UniversalSchemaMappingFile}.
     * @param obj
     *  The {@link UniversalSchemaMappingObject}.
     * @param key
     *  The value's key.
     * @param default
     *  The default value if the value could not be resolved.
     * @returns
     *  The value.
     */
    public resolveValue<T extends DuplicatedSchemaKey>(
        file: UniversalSchemaMappingFile | undefined,
        obj: Partial<UniversalSchemaMappingObject>,
        key: T,
        def?: any
    ): Required<UniversalSchemaMappingObject>[T] {
        let value;
        if(obj[key] !== undefined) {
            value = obj[key]!;
        } else if(file) {
            value = file.metadata[key]!;
        } else if(def !== undefined) {
            value = def;
        } else {
            throw new Error(`Failed to resolve '${ key }'.`);
        }
        switch(key) {
            case "technology_domain":
                return `mitre_attack_${ value }`;
            default:
                return value;
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. String Normalization  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Converts a key to title case.
     * @example
     *  keyToTitleCase("hello_world");  // "Hello World"
     *  keyToTitleCase("example_key");  // "Example Key"
     *  keyToTitleCase("author");       // "Author"
     * @param str
     *  The key to convert.
     * @returns
     *  The key in title case.
     */
    private keyToTitleCase(str: string) {
        return str
            .split(/_/)
            .map(o => `${ o[0].toLocaleUpperCase() }${ o.substring(1) }`)
            .join(" ");
    }

    /**
     * Converts text to a key.
     * @example
     *  normalize("Hello, Audrey!!!");   // "hello_audrey"
     *  normalize("  WHITE   SPACE  ");  // "white_space"
     *  normalize("ⓦⓔⓘⓡⓓ ⓣⓔⓧⓣ");   // "weird_text" 
     * @param str
     *  The text to convert.
     * @returns
     *  The text as a key.
     */
    private toKey(str: string) {
        return this.normalize(str)
            .replace(/\s/g, "_")
    }

    /**
     * Normalizes a string.
     * @param str
     *  The string to normalize.
     * @returns
     *  The normalized string.
     * @example
     *  normalize("Hello, Audrey!!!");   // "hello audrey"
     *  normalize("  WHITE   SPACE  ");  // "white space"
     *  normalize("ⓦⓔⓘⓡⓓ ⓣⓔⓧⓣ");   // "weird text" 
     * @remarks
     *  The normalized form of a string has no leading or trailing white
     *  spaces, no uppercase letters, no non-alphanumeric characters, is
     *  delimited by single spaces, and is in unicode normalization form.
     */
    private normalize(str: string): string {
        return str
            .trim()
            .toLocaleLowerCase()
            .normalize("NFKD")
            .replace(/[^a-z0-9\s_]/g, "")
            .replace(/\s+/g, " ");
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
        author                    : string | null,
        contact                   : string | null,
        organization              : string | null,
        creation_date             : string,
        last_update               : string,
        mapping_types             : UniversalSchemaMappingTypes,
        groups                    : UniversalSchemaMappingGroups
    },
    mapping_objects               : UniversalSchemaMappingObject[]
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
 * The Universal Schema Mapping Groups.
 */
type UniversalSchemaMappingGroups = {
    [key: string] : string
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
    references                            : string[],
    comments?                             : string,
    mapping_type                          : string | null,
    group?                                : string,
    status?                               : string
    score_category?                       : string,
    score_value?                          : string,
    related_score?                        : string,
}

/**
 * Computes the type intersection between type `A` and `B`.
 */
type Intersection<A,B> = {
    [P in keyof A & keyof B]: A[P] | B[P]
}

/**
 * All export keys shared between {@link MappingFileExport} and
 * {@link MappingObjectExport}.
 */
type DuplicatedExportKey = keyof Intersection<
    MappingFileExport,
    MappingObjectExport
>;

/**
 * All schema keys shared between {@link UniversalSchemaMappingFile}'s metadata
 * and {@link UniversalSchemaMappingObject}.
 */
type DuplicatedSchemaKey = keyof Intersection<
    UniversalSchemaMappingFile["metadata"],
    UniversalSchemaMappingObject
>
