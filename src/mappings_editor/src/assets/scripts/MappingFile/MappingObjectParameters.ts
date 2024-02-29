export type MappingObjectParameters = {

    /**
     * The mapping object's id.
     */
    objectId?: string;

    /**
     * The mapping object's source id.
     */
    sourceId?: string | null,

    /**
     * The mapping object's source text.
     */
    sourceText?: string | null,

    /**
     * The object's source framework version.
     */
    sourceVersion?: string,
        
    /**
     * The object's source framework.
     */
    sourceFramework?: string,

    /**
     * The mapping object's target id.
     */
    targetId?: string | null,

    /**
     * The mapping object's target text.
     */
    targetText?: string | null,

    /**
     * The object's target framework version.
     */
    targetVersion?: string,

    /**
     * The object's target framework.
     */
    targetFramework?: string,

    /**
     * The mapping object's author.
     */
    author?: string | null;

    /**
     * The author's e-mail address.
     */
    authorContact?: string | null;

    /**
     * The author's organization.
     */
    authorOrganization?: string | null;

    /**
     * The mapping object's references.
     */
    references?: string[] | string,

    /**
     * The mapping object's comments.
     */
    comments?: string | null;

    /**
     * The object's capability group.
     */
    capabilityGroup?: string | null;

    /**
     * The object's mapping type.
     */
    mappingType?: string | null;
    
    /**
     * The object's mapping status.
     */
    mappingStatus?: string | null;

    /**
     * The mapping object's score category.
     */
    scoreCategory?: string | null;

    /**
     * The mapping object's score value.
     */
    scoreValue?: string | null;

}
