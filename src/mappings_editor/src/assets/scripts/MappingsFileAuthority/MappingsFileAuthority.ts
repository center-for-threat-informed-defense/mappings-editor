import { MappingFile } from "../MappingsFile/MappingFile";
import type { FrameworkRegistry } from "./FrameworkRegistry";
import type { MappingFileExport } from "./MappingFileExport";
import { 
    DynamicFrameworkObjectProperty, 
    EditableDynamicFrameworkListing, 
    EditableStrictFrameworkListing, 
    FrameworkObjectProperty, 
    FreeFrameworkObjectProperty, 
    MappingObject,
    StrictFrameworkObjectProperty
} from "../MappingsFile";

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
    public async createMappingFile(file: MappingFileExport) {
        const sf = file.source_framework,
              sv = file.source_version,
              tf = file.target_framework,
              tv = file.target_version
        // Create template mapping object
        const [srcObj, tarObj] = [
            this.createFrameworkObjectProp(sf, sv),
            this.createFrameworkObjectProp(tf, tv)
        ]
        const mappingObjectTemplate = new MappingObject({
            sourceObject: await srcObj,
            targetObject: await tarObj,
            author: file.author,
            authorContact: file.author_contact,
            comments: "",
            group: "New Group"
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
        const newFile = await this.createMappingFile(file);
        for(const obj of file.mapping_objects) {
            // Duplicate object
            const object = newFile.mappingObjectTemplate.duplicate();
            // Configure author
            object.author = obj.author ?? object.author;
            object.authorContact = obj.author_contact ?? object.authorContact;
            // Configure comments
            object.comments = obj.comments;
            // Configure group
            object.group = obj.group;
            // Load framework object property values
            this.loadFrameworkObjectPropertyValue(
                newFile.sourceFramework,
                newFile.sourceVersion,
                obj.source_id,
                obj.source_text,
                obj.source_version ?? newFile.sourceVersion,
                object.sourceObject
            );
            this.loadFrameworkObjectPropertyValue(
                newFile.targetFramework,
                newFile.targetVersion,
                obj.target_id,
                obj.target_text,
                obj.target_version ?? newFile.targetVersion,
                object.targetObject
            );
            // Insert mapping object  
            newFile.insertMappingObject(object);
        }
        return newFile;
    }

    /**
     * Loads a value into a {@link FrameworkObjectProperty}.
     * @param fileFramework
     *  The mapping file's framework identifier.
     * @param fileVersion
     *  The mapping file's framework version.
     * @param objId
     *  The framework object's id.
     * @param objText
     *  The framework object's text.
     * @param objVersion
     *  The framework object's framework version.
     * @param prop
     *  The framework object's {@link FrameworkObjectProperty}.
     */
    public loadFrameworkObjectPropertyValue(
        fileFramework: string,
        fileVersion: string, 
        objId: string | null,
        objText: string | null,
        objVersion: string, 
        prop: FrameworkObjectProperty
    ) {
        // Validate matching frameworks
        if(prop.objectFramework !== fileFramework) {
            throw new Error(
                `Cannot load object of framework '${ 
                    prop.objectFramework
                }' into file of framework '${
                    fileFramework
                }'.`
            );
        }
        // Attempt to load strict value
        if(prop instanceof StrictFrameworkObjectProperty) {
            if(fileVersion === objVersion) {
                if(prop.framework.options.has(objId)) {
                    const text = prop.framework.options.get(objId);
                    if(text === objText) {
                        prop.objectId = objId;
                        return;
                    }
                }
                objVersion = "?";
            }
            prop.forceSet(objId, objText, objVersion);
            return;
        }
        // Attempt to load dynamic value
        if(prop instanceof DynamicFrameworkObjectProperty) {
            if(prop.objectVersion !== objVersion) {
                throw new Error(
                    `Cannot load object of dynamic framework '${
                        prop.objectFramework + "@" + prop.objectVersion
                    } into file of dynamic framework '${
                        fileFramework + "@" + fileVersion
                    }'`
                );
            }
            if(prop.framework.options.has(objId)) {
                const text = prop.framework.options.get(objId);
                if(text === objText) {
                    prop.objectId = objId;
                } else {
                    prop.forceSet(objId, objText, "?");
                }
            } else {
                prop.objectId = objId;
                prop.objectText = objText;
            }
            return;
        }
        // Attempt to load free value
        if(prop instanceof FreeFrameworkObjectProperty) {
            prop.forceSet(objId, objText, objVersion);
            return;
        }
        throw new Error(`Cannot load framework object into type '${ prop.constructor.name }'.`);
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
        const migratedFile = await this.createMappingFile(newFile);
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
        const mapping_objects = [];
        for(const object of file.mappingObjects.values()) {
            mapping_objects.push({
                source_id: object.sourceObject.objectId,
                source_text: object.sourceObject.objectText,
                source_version: object.sourceObject.objectVersion,
                source_framework: object.sourceObject.objectFramework,
                target_id: object.targetObject.objectId,
                target_text: object.targetObject.objectText,
                target_version: object.targetObject.objectVersion,
                target_framework: object.targetObject.objectFramework,
                author: object.author,
                author_contact: object.authorContact,
                comments: object.comments,
                group: object.group
            })
        }
        return {
            source_framework: file.sourceFramework,
            source_version: file.sourceVersion,
            target_framework: file.targetFramework,
            target_version: file.targetVersion,
            author: file.author,
            author_contact: file.authorContact,
            author_organization: file.authorOrganization,
            creation_date: file.creationDate,
            modified_date: file.modifiedDate,
            mapping_objects
        }
    }

}
