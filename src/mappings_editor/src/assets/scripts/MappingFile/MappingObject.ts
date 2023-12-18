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
     * The mapping object's score category.
     */
    public readonly scoreCategory: ListItemProperty;

    /**
     * The mapping object's score value.
     */
    public readonly scoreValue: ListItemProperty;

    /**
     * The mapping object's related score.
     */
    public readonly relatedScore: FrameworkObjectProperty;

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
            "Mapping Type", "id", "name", 
            new ListProperty(
                "Mapping Types",
                new ListItem(new Map([
                    ["id",          new StringProperty("ID")],
                    ["name",        new StringProperty("Name")],
                    ["description", new StringProperty("Description")]
                ]))
            )
        );
        this.mappingGroup = config.mappingGroup ?? new ListItemProperty(
            "Mapping Group", "id", "name", 
            new ListProperty(
                "Mapping Groups",
                new ListItem(new Map([
                    ["id",   new StringProperty("ID")],
                    ["name", new StringProperty("Name")]
                ]))
            )
        );
        this.mappingStatus = config.mappingStatus ?? new ListItemProperty(
            "Mapping Status", "id", "name", 
            new ListProperty(
                "Mapping Statuses",
                new ListItem(new Map([
                    ["id",   new StringProperty("ID")],
                    ["name", new StringProperty("Name")]
                ]))
            )
        ),
        this.author = config.author;
        this.authorContact = config.authorContact;
        this.authorOrganization  = config.authorOrganization;
        this.references = new ListProperty(
            "References",
            new ListItem(new Map([
                ["url", new StringProperty("URL")]
            ]))
        )
        this.comments = config.comments;
        this.scoreCategory = config.scoreCategory ?? new ListItemProperty(
            "Score Category", "id", "name", 
            new ListProperty(
                "Score Categories",
                new ListItem(new Map([
                    ["id",   new StringProperty("ID")],
                    ["name", new StringProperty("Name")]
                ]))
            )
        ),
        this.scoreValue = config.scoreValue ?? new ListItemProperty(
            "Score Value", "id", "name", 
            new ListProperty(
                "Score Values",
                new ListItem(new Map([
                    ["id",   new StringProperty("ID")],
                    ["name", new StringProperty("Name")]
                ]))
            )
        ),
        this.relatedScore = config.relatedScore ?? 
            this.targetObject.duplicate("Related Score");
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
            author             : this.author.duplicate(),
            authorContact      : this.authorContact.duplicate(),
            authorOrganization : this.authorOrganization.duplicate(),
            references         : this.references.duplicate(),
            comments           : this.comments.duplicate(),
            mappingType        : this.mappingType.duplicate(),
            mappingGroup       : this.mappingGroup.duplicate(),
            mappingStatus      : this.mappingStatus.duplicate(),
            scoreCategory      : this.scoreCategory.duplicate(),
            scoreValue         : this.scoreValue.duplicate(),
            relatedScore       : this.relatedScore.duplicate(),
        })
    }

}
