import { MappingFile } from "../MappingsFile/MappingFile";
import type { FrameworkRegistry } from "./FrameworkRegistry";
import type { MappingFileConfiguration } from "../MappingsFile/MappingFileConfiguration";
import type { MappingFileExport } from "./MappingFileExport";
import { DynamicFrameworkObjectProperty, EditableDynamicFrameworkListing, EditableStrictFrameworkListing, FrameworkObjectProperty, MappingObject, StrictFrameworkListing, StrictFrameworkObjectProperty } from "../MappingsFile";

export class MappingsFileAuthority {

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

    public async createMappingFile(file: MappingFileExport) {
        const sf = file.source_framework,
              sv = file.source_version,
              tf = file.target_framework,
              tv = file.target_version
        // Create template mapping object
        const [srcObj, tarObj] = [
            this.createFrameworkObjectProperty(sf, sv, "Source Object"),
            this.createFrameworkObjectProperty(tf, tv, "Target Object")
        ]
        const mappingObjectTemplate = new MappingObject({
            sourceFramework: sf,
            sourceVersion: sv,
            targetFramework: tf,
            targetVersion: tv,
            sourceObject: await srcObj,
            targetObject: await tarObj,
            author: file.author,
            authorContact: file.author_contact,
            comments: "",
            group: "New Objects"
        });
        // Create mapping file
        const mappingFile = new MappingFile({
            sourceFramework: sf,
            sourceVersion: sv,
            targetFramework: tf,
            targetVersion: tv,
            author: file.author,
            authorContact: file.author_contact,
            authorOrganization: file.author_organization,
            creationDate: file.creation_date ?? new Date(),
            modifiedDate: file.modified_date ?? new Date(),
            mappingObjectTemplate
        });
        return mappingFile;
    }

    /**
     * Creates a new Mapping File.
     * @param file
     *  The new Mapping File's options.
     * @returns
     *  The newly created Mapping File.
     */
    public async loadMappingFile(file: MappingFileExport): MappingFile {
        const newFile = await this.createMappingFile(file);
        for(const object of file.mappingObjects) {
            

        }
        return newFile;
    }

    /**
     * Migrates an existing Mapping File to a new Mapping File.
     * @param file
     *  The existing Mapping File.
     * @param options
     *  The new Mapping File's options.
     * @returns
     *  The migrated Mapping File.
     */
    public migrateMappingFile(file: MappingFile, options: MappingFileConfiguration): MappingFile {
        const migratedFile = this.createMappingFile(options);
    }

    /**
     * Exports a mapping file to a plain JSON object.
     * @param file
     *  The Mapping File to export.
     * @returns
     *  The exported Mapping File.
     */
    public exportMappingsFile(file: MappingFile): MappingFileExport {
        // return "";
    }

    
    public auditMappingFile(file: MappingFile) {
        console.log(file);
    }

    public auditMappingObject(file: MappingFile) {
        console.log(file);
    }




    /**
     * Creates an empty {@link FrameworkObjectProperty}.
     * @param id
     *  The framework's id.
     * @param version
     *  The framework's version.
     * @param name
     *  The property's name.
     * @returns
     *  The newly created {@link FrameworkObjectProperty}.
     */
    private async createFrameworkObjectProperty(
        id: string, version: string, name: string
    ): Promise<FrameworkObjectProperty> {
        // If the registry has the framework...
        if(this.registry.hasFramework(id, version)) {
            // ...create a strict framework object property
            const framework = await this.registry.getFramework(id, version);
            const listing = new EditableStrictFrameworkListing();
            for(const name in framework.categories) {
                const category = framework.categories[name];
                for(const object of category){
                    listing.registerListing(object.id, object.name);
                }
            }
            return new StrictFrameworkObjectProperty(name, listing);
        }
        // If the registry does not have the framework...
        else {
            // ...create a dynamic framework object property
            const listing = new EditableDynamicFrameworkListing();
            return new DynamicFrameworkObjectProperty(name, listing);
        }
    }
}
