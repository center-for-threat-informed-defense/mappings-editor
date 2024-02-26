import Configuration from "@/assets/configuration/app.config";
import Papa from "papaparse";
import { stringify } from "yaml";
import { Workbook } from "exceljs";
import type {
    MappingFileExport,
    MappingFileImport,
    MappingObjectExport,
    MappingObjectImport
} from "../../MappingFileAuthority";
import type { 
    AttackNavigatorLayer,
    AttackTechniqueMetadata
} from "./AttackNavigatorTypes";

export class MappingFileSerializer {

    /**
     * Creates a new {@link MappingFileSerializer}.
     */
    constructor(){}


    ///////////////////////////////////////////////////////////////////////////
    //  1. Serialization  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Serializes a {@link MappingFileExport} to a string. 
     * @param file
     *  The file to serialize.
     * @returns
     *  The serialized {@link MappingFileExport}.
     */
    public serialize(file: MappingFileExport): string {
        // Compress mapping objects
        const mapping_objects = new Array(file.mapping_objects.length);
        for(let i = 0; i < file.mapping_objects.length; i++) {
            mapping_objects[i] = this.compressObjectExport(file.mapping_objects[i], file);
        }
        // Return file
        return JSON.stringify({ ...file, mapping_objects }, null, 4)
    }

    /**
     * Serializes a list of {@link MappingObjectExport}s to the clipboard.
     * @param objects
     *  The objects to serialize.
     * @returns
     *  The serialized {@link MappingObjectExport}s.
     */
    public processCopy(objects: MappingObjectExport[]): string {
        return this.objectsToCsv(
            objects.map(o => this.compressObjectExport(o)
        ), "\t");
    }

    /**
     * Compresses a {@link MappingObjectExport}.
     * @remarks
     *  By specifying a `file`, certain keys will be omitted from the mapping
     *  object because they are assumed to already be defined at the mapping
     *  file level. (e.g. `author`, `author_contact`, etc.)
     * @param obj
     *  The {@link MappingObjectExport} to compress.
     * @param file
     *  The {@link MappingFileExport} the object export belongs to.
     * @returns
     *  The {@link CompressedMappingObjectExport}.
     */
    protected compressObjectExport(
        obj: MappingObjectExport,
        file?: MappingFileExport
    ): CompressedMappingObjectExport {
        return {
            source_id           : obj.source_id,
            source_text         : obj.source_text,
            mapping_type        : obj.mapping_type,
            target_id           : obj.target_id,
            target_text         : obj.target_text,
            capability_group    : obj.capability_group  ?? undefined,
            score_category      : obj.score_category    ?? undefined,
            score_value         : obj.score_value       ?? undefined,
            mapping_status      : obj.mapping_status    ?? undefined,
            comments            : obj.comments          ?? undefined,
            references          : obj.references,
            author              : this.maskValue(file, obj, "author"),
            author_contact      : this.maskValue(file, obj, "author_contact"),
            author_organization : this.maskValue(file, obj, "author_organization"),
            source_framework    : this.maskValue(file, obj, "source_framework"),
            source_version      : this.maskValue(file, obj, "source_version"),
            target_framework    : this.maskValue(file, obj, "target_framework"),
            target_version      : this.maskValue(file, obj, "target_version"),
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
    protected maskValue(
        file: MappingFileExport | undefined,
        obj: MappingObjectExport,
        key: DuplicatedExportKey
    ): string | undefined {
        if(!file || file[key] !== obj[key]) {
            return obj[key] ?? undefined;
        } else {
            return undefined;
        }
    }

    
    ///////////////////////////////////////////////////////////////////////////
    //  2. Deserialization  ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Deserializes a string to a {@link MappingFileImport}. 
     * @param file
     *  The file to deserialize.
     * @returns
     *  The deserialized {@link MappingFileImport}.
     */
    public deserialize(file: string): MappingFileImport {
        const json = JSON.parse(file) as MappingFileImport;
        const mapping_objects = json.mapping_objects ?? [];
        // Parse mapping file
        const types = Object.keys(json.mapping_types);
        const default_mapping_type = types.length === 1 ? types[0] : null;
        const mappingFileImport: MappingFileImport = {
            version                : json.version,
            source_framework       : json.source_framework,
            source_version         : json.source_version,
            target_framework       : json.target_framework,
            target_version         : json.target_version,
            author                 : json.author,
            author_contact         : json.author_contact,
            author_organization    : json.author_organization,
            creation_date          : json.creation_date,
            modified_date          : json.modified_date ,
            capability_groups      : json.capability_groups,
            mapping_types          : json.mapping_types,
            mapping_statuses       : json.mapping_statuses,
            score_categories       : json.score_categories,
            score_values           : json.score_values,
            mapping_objects        : new Array(mapping_objects.length),
            default_mapping_type   : json.default_mapping_type || default_mapping_type,
            default_mapping_status : json.default_mapping_status
        }
        // Process mapping objects
        for(let i = 0; i < mapping_objects.length; i++) {
            const obj = this.processIncompleteMappingObjectImport(mapping_objects[i]);
            mappingFileImport.mapping_objects![i] = obj; 
        }
        // Return file
        return mappingFileImport;
    }

    /**
     * Deserializes a list of {@link MappingObjectImport}s from the clipboard.
     * @param str
     *  The objects to deserialize.
     * @returns
     *  The deserialized {@link MappingObjectImport}s.
     */
    public processPaste(str: string): MappingObjectImport[] {
        const objects = this.csvToObjects<MappingObjectImport>(str);
        // Format imports
        const imports = new Array(objects.length);
        for(let i = 0; i < objects.length; i++) {
            imports[i] = this.processIncompleteMappingObjectImport(objects[i]);
        }
        return imports;
    }

    /**
     * Processes an incompletely defined {@link MappingObjectImport}.
     * @remarks
     *  This function also serves to filter the properties of `obj` down to
     *  those strictly defined by {@link MappingObjectImport}.
     * @param obj
     *  The {@link MappingObjectImport} to process.
     * @returns
     *  The processed object import.
     */
    protected processIncompleteMappingObjectImport(
        obj: Partial<MappingObjectImport> | MappingObjectImport
    ): MappingObjectImport {
        return {
            source_id           : obj.source_id,
            source_text         : obj.source_text,
            source_version      : obj.source_version,
            source_framework    : obj.source_framework,
            target_id           : obj.target_id,
            target_text         : obj.target_text,
            target_version      : obj.target_version,
            target_framework    : obj.target_framework,
            author              : obj.author,
            author_contact      : obj.author_contact,
            author_organization : obj.author_organization,
            references          : obj.references,
            comments            : obj.comments,
            capability_group    : obj.capability_group,
            mapping_type        : obj.mapping_type,
            mapping_status      : obj.mapping_status,
            score_category      : obj.score_category,
            score_value         : obj.score_value
        }
    }

    /**
     * Returns the value of the specified {@link MappingObjectExport}
     * key. If the value isn't defined on the mapping object, the value is
     * resolved from a {@link MappingFileExport} instead.  
     * @param file
     *  The {@link MappingFileExport}.
     * @param obj
     *  The {@link MappingObjectExport}.
     * @param key
     *  The value's key.
     * @returns
     *  The value.
     */
    protected resolveValue<T extends DuplicatedExportKey>(
        file: MappingFileImport,
        obj: Partial<MappingObjectImport>,
        key: T
    ): Required<MappingObjectExport>[T] | undefined {
        let value;
        if(obj[key] !== undefined) {
            value = obj[key]!;
        } else if(file[key] !== undefined) {
            value = file[key]!;
        } else {
            throw new Error(`Failed to resolve '${ key }'.`);
        }
        return value;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. Import / Export  ///////////////////////////////////////////////////
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
        for(const obj of file.mapping_objects) {
            objects.push({
                source_id           : obj.source_id,
                source_text         : obj.source_text,
                mapping_type        : this.getListItemName(file.mapping_types, obj.mapping_type),
                target_id           : obj.target_id,
                target_text         : obj.target_text,
                capability_group    : this.getListItemName(file.capability_groups, obj.capability_group),
                score_category      : this.getListItemName(file.score_categories, obj.score_category),
                score_value         : this.getListItemName(file.score_values, obj.score_value),
                comments            : obj.comments,
                references          : obj.references,
                author              : obj.author,
                source_framework    : obj.source_framework,
                source_version      : obj.source_version,
                target_framework    : obj.target_framework,
                target_version      : obj.target_version,
                creation_date       : file.creation_date,
                modified_date       : file.modified_date
            })
        }
        return objects;
    }

    /**
     * Resolves the name of a list item.
     * @param list
     *  The list.
     * @param item
     *  The list item's identifier. 
     * @returns
     *  The name of the list item.
     */
    protected getListItemName<T extends ListPropertyExport>(list: T, item?: string | null): string | null {
        if(item === null || item === undefined) {
            return null;
        }
        const value = list[item];
        if(value && typeof value !== "string") {
            return value.name;
        }
        return value ?? item;
    }

    /**
     * Exports a {@link MappingFileExport} to a CSV file.
     * @param file
     *  The mapping file.
     * @param delimiter
     *  The CSV's delimiter.
     *  (Default: Automatic)
     * @returns
     *  The CSV file.
     */
    public toCsvFile(file: MappingFileExport, delimiter?: string): string {
        return this.objectsToCsv(this.fileToObjects(file), delimiter);
    }

    /**
     * Exports a {@link MappingFileExport} to a YAML file.
     * @param file
     *  The mapping file.
     * @returns
     *  The YAML file.
     */
    public toYamlFile(file: MappingFileExport): string {
        return this.objectToYaml({ mapping_objects: this.fileToObjects(file) });
    }

    /**
     * Exports a {@link MappingFileExport} to a Microsoft Excel file.
     * @param file
     *  The mapping file.
     * @param name
     *  The name of the worksheet. The name MUST be between 1 to 31 characters.
     * @returns
     *  A Promise that resolves with the Microsoft Excel File.
     */
    public toExcelFile(file: MappingFileExport, name: string): Promise<Blob> {
        return this.objectsToExcelFile(this.fileToObjects(file), name);
    }

    /**
     * Exports a {@link MappingFileExport} to an ATT&CK Navigator Layer.
     * @param file
     *  The mapping file.
     * @returns
     *  The ATT&CK Navigator Layer.
     */
    public toNavigatorLayer(file: MappingFileExport): string {
        // Resolve domain
        const navigatorSupport = Configuration.frameworks_with_navigator_support;
        const domain = navigatorSupport.get(file.target_framework);
        if(!domain) {
            throw new Error(`Export failed: Unsupported target framework '${ 
                file.target_framework
            }'.`)
        }
        // Compile Techniques
        type TechniqueMappings = {
            source_ids : Set<string>,
            metadata   : AttackTechniqueMetadata[]
        }
        const techniques = new Map<string, TechniqueMappings>();
        for(const obj of file.mapping_objects) {
            if(obj.source_id === null || obj.target_id === null) {
                continue;
            }
            // Select technique
            if(!techniques.has(obj.target_id)) {
                techniques.set(obj.target_id, {
                    source_ids: new Set(),
                    metadata: []
                })
            }
            const technique = techniques.get(obj.target_id)!;
            // Register source
            technique.source_ids.add(obj.source_id)
            // Append metadata
            const metadata = []
            if(obj.score_category !== null) {
                metadata.push({ name: "category", value: obj.score_category });
            }
            if(obj.score_value !== null) {
                metadata.push({ name: "value", value: obj.score_value  });
            }
            if(obj.comments !== null) {
                metadata.push({ name: "comment", value: obj.comments });
            }
            if(metadata.length) {
                technique.metadata.push(
                    { name: "capability",  value: obj.source_id },
                    ...metadata,
                    { divider: true }
                )
            }   
        }
        // Create layer
        const source = this.keyToTitleCase(file.source_framework);
        const description = 
            `Heatmap of ${ source } mappings. Scores ` + 
            `represent the number of associated capabilities.`
        const layer: AttackNavigatorLayer = {
            name          : `${ source } Mappings`,
            versions: {
                navigator : "4.8.0",
                layer     : "4.4",
                attack    : file.target_version,
            },
            sorting       : 3,
            description   : description,
            domain        : `${domain}-attack`,
            techniques    : [],
            gradient: {
                colors    : ["#ffe766", "#ffaf66"],
                minValue  : 0,
                maxValue  : 100
            },
        }
        for(const [id, technique] of techniques) {
            if(technique.metadata.length) {
                technique.metadata.unshift({ divider: true });
            }
            layer.techniques.push({
                techniqueID : id,
                score       : technique.source_ids.size,
                comment     : `Related to:\n•${ [...technique.source_ids].join("\n•")}`,
                metadata    : technique.metadata
            });
        }
        // Calculate gradient
        const scores = layer.techniques.map(o => o.score);
        if(scores.length) {
            layer.gradient.minValue = Math.min(...scores);
            layer.gradient.maxValue = Math.max(...scores);
        }
        // Return Navigator Layer
        return JSON.stringify(layer, null, 4);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Serialization Helpers  /////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Serializes an array of objects to CSV.
     * @param object
     *  The objects to serialize.
     * @param delimiter
     *  The CSV's delimiter.
     *  (Default: Automatic)
     * @returns
     *  The serialized CSV.
     */
    protected objectsToCsv(objects: TextualObject[], delimiter?: string): string {
        if(objects.length === 0) {
            return "";
        }
        const keys = Object.keys(objects[0]);
        const rows = new Array(1 + objects.length);
        // Configure header column
        rows[0] = keys.map(k => this.keyToTitleCase(k));
        // Configure data columns
        for(let i = 0; i < objects.length; i++) {
            rows[i + 1] = keys.map(k => objects[i][k]);
        }
        return Papa.unparse(rows, { delimiter });
    }

    /**
     * Deserializes a CSV to an array of objects.
     * @param objects
     *  The CSV.
     * @returns
     *  The deserialized objects.
     */
    protected csvToObjects<T>(objects: string): T[] {
        return Papa.parse<T>(objects, {
            header          : true,
            transformHeader : (header) => this.toKey(header)
        }).data;
    }

    /**
     * Serializes an array of objects to a Microsoft Excel File.
     * @param objects
     *  The objects to serialize.
     * @param name
     *  The name of the worksheet. The name MUST be between 1 to 31 characters.
     * @returns
     *  A Promise that resolves with the serialized Microsoft Excel file.
     */
    protected async objectsToExcelFile(objects: TextualObject[], name: string): Promise<Blob> {
        // Construct workbook
        const workbook = new Workbook();
        const sheet = workbook.addWorksheet(name.substring(0, 31));
        if(objects.length) {
            const keys = Object.keys(objects[0]);
            // Configure table header
            const columns = keys.map(k => ({ 
                name         : this.keyToTitleCase(k),
                filterButton : true
            }))
            // Configure data rows
            const rows = new Array(objects.length);
            for(let i = 0; i < objects.length; i++) {
                rows[i] = keys.map(k => {
                    const value = objects[i][k];
                    if(Array.isArray(value)) {
                        return value.join(",");
                    } else {
                        return value ?? "";
                    }
                })
            }
            // Configure table
            sheet.addTable({ name: "MyTable", ref: "A1", columns, rows });
        }
        // Serialize workbook
        const buffer = await workbook.xlsx.writeBuffer();
        return new Blob([buffer], { type: "application/xlsx" })
    }

    /**
     * Serializes an object to YAML.
     * @param object
     *  The object to serialize.
     * @returns
     *  The serialized YAML.
     */
    protected objectToYaml(object: Object): string {
        return stringify(object);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. String Normalization  //////////////////////////////////////////////
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
    protected keyToTitleCase(str: string): string {
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
    protected toKey(str: string): string {
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
    protected normalize(str: string): string {
        return str
            .trim()
            .toLocaleLowerCase()
            .normalize("NFKD")
            .replace(/[^a-z0-9\s_]/g, "")
            .replace(/\s+/g, " ");
    }

}

/**
 * Textual object definition
 */
export type TextualObject = {
    [key: string]: string | string[] | Date | undefined | null
}

/**
 * The compressed Mapping Object Export format.
 */
type CompressedMappingObjectExport = {
    source_id            : string | null;
    source_text          : string | null;
    mapping_type         : string | null;
    target_id            : string | null;
    target_text          : string | null;
    capability_group?    : string;
    score_category?      : string;
    score_value?         : string;
    mapping_status?      : string;
    comments?            : string;
    references           : string | string[];
    author?              : string;
    author_contact?      : string;
    author_organization? : string;
    source_version?      : string;
    source_framework?    : string;
    target_version?      : string;
    target_framework?    : string;
}

/**
 * List Property Export definition.
 */
type ListPropertyExport = { [ key: string ] : { name: string } | string }

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
