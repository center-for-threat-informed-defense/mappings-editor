import type { FrameworkObjectProperty } from "./Property";

export type MappingObjectConfiguration = {

    /**
     * The mapping object's source.
     */
    sourceObject: FrameworkObjectProperty,
    
    /**
     * The mapping object's target.
     */
    targetObject: FrameworkObjectProperty

    /**
     * The mapping object's author.
     */
    author: string;

    /**
     * The author's e-mail address.
     */
    authorContact: string;

    /**
     * The mapping object's comments.
     */
    comments: string;

    /**
     * The mapping object's comments.
     */
    group: string;

}
