import { randomUUID } from "../Utilities";
import { StringProperty, ListItemProperty, ListProperty, ListItem } from ".";
import type { MappingFile } from "./MappingFile";
import type { FrameworkObjectProperty } from "./Property/FrameworkObjectProperty/FrameworkObjectProperty";
import type { MappingObjectConfiguration } from "./MappingFileConfiguration";

export class MappingObject {

    /**
     * The mapping object's id.
     */
    public readonly id: string;

    /**
     * The mapping object's source.
     */
    public sourceObject: FrameworkObjectProperty;

    /**
     * The mapping object's target.
     */
    public targetObject: FrameworkObjectProperty;

    /**
     * The mapping object's mapping type.
     */
    public readonly mappingType: ListItemProperty;

    /**
     * The mapping object's mapping group.
     */
    public readonly mappingGroup: ListItemProperty;

    /**
     * The mapping object's mapping status.
     */
    public readonly mappingStatus: ListItemProperty;

    /**
     * The mapping object's author.
     */
    public readonly author: StringProperty;

    /**
     * The author's e-mail address.
     */
    public readonly authorContact: StringProperty;

    /**
     * The author's organization.
     */
    public readonly authorOrganization: StringProperty;

    /**
     * The mapping object's references.
     */
    public readonly references: ListProperty;

    /**
     * The mapping object's comments.
     */
    public readonly comments: StringProperty;

    /**
     * The mapping file the mapping object belongs to.
     */
    public file: MappingFile | null;

    /**
     * True if the mapping is valid within its mapping file, false otherwise.
     */
    public get isValid() {
        // If mapping isn't associated with a file, it can never be valid.
        if(this.file === null) return false;
        const isFrameworkValid = 
            this.sourceObject.objectFramework === this.file.sourceFramework &&
            this.targetObject.objectFramework === this.file.targetFramework;
        const isVersionValid = 
            this.targetObject.objectVersion === this.file.targetVersion &&
            this.sourceObject.objectVersion === this.file.sourceVersion
        return isFrameworkValid && isVersionValid;
    }


    /**
     * Creates a new {@link MappingObject}.
     * @param sourceObject
     *  The source object.
     * @param targetObject
     *  The target object.
     */
    constructor(config: MappingObjectConfiguration) {
        this.id = randomUUID();
        this.sourceObject = config.sourceObject;
        this.targetObject = config.targetObject;
        this.mappingType = config.mappingType ?? new ListItemProperty(
            "id", "name", 
            new ListProperty(
                new ListItem(new Map([
                    ["id",          new StringProperty()],
                    ["name",        new StringProperty()],
                    ["description", new StringProperty()]
                ]))
            )
        );
        this.mappingGroup = config.mappingGroup ?? new ListItemProperty(
            "id", "name", 
            new ListProperty(
                new ListItem(new Map([
                    ["id",   new StringProperty()],
                    ["name", new StringProperty()]
                ]))
            )
        );
        this.mappingStatus = config.mappingStatus ?? new ListItemProperty(
            "id", "name", 
            new ListProperty(
                new ListItem(new Map([
                    ["id",   new StringProperty()],
                    ["name", new StringProperty()]
                ]))
            )
        ),
        this.author = config.author;
        this.authorContact = config.authorContact;
        this.authorOrganization  = config.authorOrganization;
        this.references = new ListProperty(
            new ListItem(new Map([
                ["url", new StringProperty()]
            ]))
        )
        this.comments = config.comments;
        this.file = null;
    }


    /**
     * Duplicate's the mapping object.
     * @returns
     *  The duplicated mapping object.
     */
    public duplicate(): MappingObject {
        return new MappingObject({
            sourceObject       : this.sourceObject.duplicate(),
            targetObject       : this.targetObject.duplicate(),
            mappingType        : this.mappingType.duplicate(),
            mappingGroup       : this.mappingGroup.duplicate(),
            mappingStatus      : this.mappingStatus.duplicate(),
            author             : this.author.duplicate(),
            authorContact      : this.authorContact.duplicate(),
            authorOrganization : this.authorOrganization.duplicate(),
            references         : this.references.duplicate(),
            comments           : this.comments.duplicate()
        })
    }

}
