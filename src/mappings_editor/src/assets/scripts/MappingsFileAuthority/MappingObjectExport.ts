export type MappingObjectExport = {

    /**
     * The mapping object's source id.
     */
    source_id: string | null,

    /**
     * The mapping object's source text.
     */
    source_text: string | null,

    /**
     * The object's source framework version.
     */
    source_version?: string,
        
    /**
     * The object's source framework.
     */
    source_framework?: string,

    /**
     * The mapping object's target id.
     */
    target_id: string | null,

    /**
     * The mapping object's target text.
     */
    target_text: string | null,

    /**
     * The object's target framework version.
     */
    target_version?: string,

    /**
     * The object's target framework.
     */
    target_framework?: string,

    /**
     * The mapping object's author.
     */
    author: string;

    /**
     * The author's e-mail address.
     */
    author_contact: string;

    /**
     * The mapping object's comments.
     */
    comments: string;

    /**
     * The mapping object's group.
     */
    group: string;
    
}
