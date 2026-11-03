import { randomUUID } from "../Utilities";
import { type Property, StringProperty, ListItemProperty, ListProperty, ListItem, ComputedProperty } from ".";
import type { MappingFile } from "./MappingFile";
import type { FrameworkObjectProperty } from "./Property/FrameworkObjectProperty/FrameworkObjectProperty";
import type { MappingObjectConfiguration } from "./MappingFileConfiguration";
import type { MappingObjectProblem } from "./MappingObjectProblem";

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
     * The mapping object's capability group.
     */
    public readonly capabilityGroup: ListItemProperty;

    /**
     * The mapping object's mapping type.
     */
    public readonly mappingType: ListItemProperty;

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

    public readonly mitigations: ListProperty;
    public readonly rationale: StringProperty;
    public readonly evidenceCapability: StringProperty;
    public readonly confidenceLevel: StringProperty;
    public readonly changelog: StringProperty;


    /**
     * The mapping object's score category.
     */
    public readonly scoreCategory: ListItemProperty;

    /**
     * The mapping object's score value.
     */
    public readonly scoreValue: ListItemProperty;

    /**
     * The mapping object's validity.
     */
    public readonly isValid: ComputedProperty<boolean>;

    /**
     * The problems (if any) associated with a mappings object
     */
    public problems: MappingObjectProblem[]

    /**
     * The mapping file the mapping object belongs to.
     */
    public file: MappingFile | null;


    /**
     * Creates a new {@link MappingObject}.
     * @param config
     *  The mapping object's configuration.
     */
    constructor(config: MappingObjectConfiguration) {
        this.id = config.objectId ?? randomUUID();
        this.sourceObject = config.sourceObject;
        this.targetObject = config.targetObject;
        this.capabilityGroup = config.capabilityGroup ?? new ListItemProperty(
            "Capability Group", "id", "name",
            new ListProperty(
                "Capability Groups",
                new ListItem(new Map([
                    ["id",   new StringProperty("ID")],
                    ["name", new StringProperty("Name")]
                ]))
            )
        );
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
        this.references = config.references ?? new ListProperty(
            "References",
            new ListItem(new Map([
                ["url", new StringProperty("URL")]
            ]))
        )
        this.problems = config.problems;
        this.comments = config.comments ?? new StringProperty("Comments");
        const relevanceOptions = new ListProperty(
            "Relevance Options",
            new ListItem(new Map([
                ["id", new StringProperty("ID")],
                ["name", new StringProperty("Name")]
            ]))
        );
        for(const [id, name] of [["true", "Yes"], ["false", "No"]]) {
            relevanceOptions.insertListItem(relevanceOptions.createNewItem({ id, name }));
        }
        this.mitigations = config.mitigations ?? new ListProperty(
            "Mitigations",
            new ListItem(new Map<string, Property>([
                ["attack_object_id", new StringProperty("ATT&CK Object ID")],
                ["attack_object_name", new StringProperty("ATT&CK Object Name")],
                ["most_relevant", new ListItemProperty("Most Relevant", "id", "name", relevanceOptions)]
            ]))
        );
        this.rationale = config.rationale ?? new StringProperty("Rationale");
        this.evidenceCapability = config.evidenceCapability ?? new StringProperty("Evidence Capability");
        this.confidenceLevel = config.confidenceLevel ?? new StringProperty("Confidence Level");
        this.changelog = config.changelog ?? new StringProperty("Changelog");

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
        )
        this.isValid = new ComputedProperty(
            "Is Valid",
            () => {

                // If mapping isn't associated with a file, it can never be valid.
                if(this.file === null) {
                    return false;
                }
                // Validate source object
                const valid = this.sourceObject.objectFramework === this.file.sourceFramework
                    && this.targetObject.objectFramework === this.file.targetFramework
                // Validate target object
                    && this.targetObject.objectVersion === this.file.targetVersion
                    && this.sourceObject.objectVersion === this.file.sourceVersion
                // Validate ListItemProperties
                    && !this.capabilityGroup.isValueCached()
                    && !this.mappingType.isValueCached()
                    && !this.mappingStatus.isValueCached()
                    && !this.scoreCategory.isValueCached()
                    && !this.scoreValue.isValueCached()
                // Each mitigation must identify and name its ATT&CK object.
                    && [...this.mitigations.value.values()].every(item =>
                        item.getAsString("attack_object_id").trim().length > 0
                        && item.getAsString("attack_object_name").trim().length > 0
                    )
                // If there are any problems and status is version change detected, mark as invalid
                // If there are problems but status is anything else, mark mapping as valid
                    && !(this.mappingStatus.exportValue === "version_changed" && this.problems.length > 0);
                // currently this is acting funky and I think it has to do with the caching of values- the part I added is working as expected
                    return valid

            }
        )
        this.file = null;
    }


    /**
     * Duplicates the mapping object.
     * @returns
     *  The duplicated mapping object.
     */
    public duplicate(): MappingObject;

    /**
     * Duplicates the mapping object.
     * @param id
     *  The duplicated mapping object's id.
     * @returns
     *  The duplicated mapping object.
     */
    public duplicate(id?: string): MappingObject;
    public duplicate(id?: string): MappingObject {
        return new MappingObject({
            objectId           : id,
            sourceObject       : this.sourceObject.duplicate(),
            targetObject       : this.targetObject.duplicate(),
            author             : this.author.duplicate(),
            authorContact      : this.authorContact.duplicate(),
            authorOrganization : this.authorOrganization.duplicate(),
            references         : this.references.duplicate(),
            comments           : this.comments.duplicate(),
            mitigations        : this.mitigations.duplicate(),
            rationale          : this.rationale.duplicate(),
            evidenceCapability : this.evidenceCapability.duplicate(),
            confidenceLevel    : this.confidenceLevel.duplicate(),
            changelog          : this.changelog.duplicate(),
            capabilityGroup    : this.capabilityGroup.duplicate(),
            mappingType        : this.mappingType.duplicate(),
            mappingStatus      : this.mappingStatus.duplicate(),
            scoreCategory      : this.scoreCategory.duplicate(),
            scoreValue         : this.scoreValue.duplicate(),
            problems           : this.problems
        });
    }

}
