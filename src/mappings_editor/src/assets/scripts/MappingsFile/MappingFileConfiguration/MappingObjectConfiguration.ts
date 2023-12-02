import type { FrameworkObjectProperty, ListItemProperty, ListProperty, StringProperty } from "../Property";

export type MappingObjectConfiguration = {

    /**
     * The mapping object's source.
     */
    sourceObject: FrameworkObjectProperty;
    
    /**
     * The mapping object's target.
     */
    targetObject: FrameworkObjectProperty;

    /**
     * The mapping object's mapping type.
     */
    mappingType?: ListItemProperty;

    /**
     * The mapping object's mapping group.
     */
    mappingGroup?: ListItemProperty;

    /**
     * The mapping object's mapping status.
     */
    mappingStatus?: ListItemProperty;

    /**
     * The mapping object's author.
     */
    author: StringProperty;

    /**
     * The author's e-mail address.
     */
    authorContact: StringProperty;

    /**
     * The author's organization.
     */
    authorOrganization: StringProperty;
    
    /**
     * The mapping object's references.
     */
    references?: ListProperty;

    /**
     * The mapping object's comments.
     */
    comments: StringProperty;

}