import { randomUUID } from "../Utilities";
import type { MappingFile } from "./MappingFile";
import type { MappingObjectConfiguration } from "./MappingObjectConfiguration";
import type { FrameworkObjectProperty } from "./Property/FrameworkObjectProperty/FrameworkObjectProperty";

// TODO: Missing 'mappingType' and 'status'

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
     * The mapping object's author.
     */
    public author: string;

    /**
     * The author's e-mail address.
     */
    public authorContact: string;

    /**
     * The mapping object's comments.
     */
    public comments: string;

    /**
     * The mapping object's comments.
     */
    public group: string;

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
        this.sourceObject = config.sourceObject;
        this.targetObject = config.targetObject;
        this.author = config.author;
        this.authorContact = config.authorContact
        this.comments = config.comments
        this.group = config.group
        this.file = null;
    }


    /**
     * Duplicate's the mapping object.
     * @returns
     *  The duplicated mapping object.
     */
    public duplicate(): MappingObject {
        return new MappingObject({
            sourceObject: this.sourceObject.duplicate(),
            targetObject: this.targetObject.duplicate(),
            author: this.author,
            authorContact: this.authorContact,
            comments: this.comments,
            group: this.group
        })
    }

}
