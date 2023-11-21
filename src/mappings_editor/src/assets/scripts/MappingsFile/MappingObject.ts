import { randomUUID } from "../Utilities";
import type { MappingFile } from "./MappingFile";
import type { MappingObjectConfiguration } from "./MappingObjectConfiguration";
import type { FrameworkObjectProperty } from "./Property/FrameworkObjectProperty/FrameworkObjectProperty";
import { StringProperty } from "./Property/StringProperty";

export class MappingObject {

    /**
     * The mapping object's id.
     */
    public readonly id: string;
    
    /**
     * The file's source framework.
     */
    public readonly sourceFramework: string;

    /**
     * The file's source framework version.
     */
    public readonly sourceVersion: string;

    /**
     * The file's target framework.
     */
    public readonly targetFramework: string;

    /**
     * The file's target framework version.
     */
    public readonly targetVersion: string;

    /**
     * The mapping object's source.
     */
    public sourceObject: FrameworkObjectProperty;

    /**
     * The mapping object's target.
     */
    public targetObject: FrameworkObjectProperty;

    /**
     * The mapping object's author.
     */
    public readonly author: StringProperty;

    /**
     * The author's e-mail address.
     */
    public readonly authorContact: StringProperty;

    /**
     * The mapping object's comments.
     */
    public readonly comments: StringProperty;

    /**
     * The mapping object's comments.
     */
    public readonly group: StringProperty;

    /**
     * The mapping file the mapping object belongs to.
     */
    public file: MappingFile | null;


    /**
     * Creates a new {@link MappingObject}.
     * @param sourceObject
     *  The source object.
     * @param targetObject
     *  The target object.
     */
    constructor(config: MappingObjectConfiguration) {
        this.id = randomUUID();
        this.sourceFramework = config.sourceFramework,
        this.sourceVersion = config.sourceVersion,
        this.targetFramework = config.targetFramework,
        this.targetVersion = config.targetVersion,
        this.sourceObject = config.sourceObject;
        this.targetObject = config.targetObject;
        this.author = new StringProperty(
            "Author",
            config.author
        );
        this.authorContact = new StringProperty(
            "Author Contact",
            config.authorContact
        )
        this.comments = new StringProperty(
            "Comments",
            config.comments
        );
        this.group = new StringProperty(
            "Group",
            config.group
        )
        this.file = null;
    }


    /**
     * Duplicate's the mapping object.
     * @returns
     *  The duplicated mapping object.
     */
    public duplicate(): MappingObject {
        return new MappingObject({
            sourceFramework: this.sourceFramework,
            sourceVersion: this.sourceVersion,
            targetFramework: this.targetFramework,
            targetVersion: this.targetVersion,
            sourceObject: this.sourceObject.duplicate(),
            targetObject: this.targetObject.duplicate(),
            author: this.author.value ?? "",
            authorContact: this.authorContact.value ?? "",
            comments: this.comments.value ?? "",
            group: this.group.value ?? ""
        })
    }

}
