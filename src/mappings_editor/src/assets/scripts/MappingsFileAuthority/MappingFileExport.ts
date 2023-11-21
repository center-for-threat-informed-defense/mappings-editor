export type MappingFileExport = { 

    /**
     * The file's source framework.
     */
    source_framework: string,

    /**
     * The file's source framework version.
     */
    source_version: string,

    /**
     * The file's target framework.
     */
    target_framework: string,

    /**
     * The file's target framework version.
     */
    target_version: string,

    /**
     * The file's author.
     */
    author: string;

    /**
     * The author's e-mail.
     */
    author_contact: string;

    /**
     * The author's organization.
     */
    author_organization: string;

    /**
     * The file's creation date.
     */
    creation_date?: Date;

    /**
     * The file's last modified date.
     */
    modified_date?: Date;

    /**
     * The file's objects.
     */
    mappingObjects: {
        
        /**
         * The object's source framework.
         */
        source_framework: string,

        /**
         * The object's source framework version.
         */
        source_version: string,

        /**
         * The object's target framework.
         */
        target_framework: string,

        /**
         * The object's target framework version.
         */
        target_version: string,

        /**
         * The mapping object's source id.
         */
        source_id: string,

        /**
         * The mapping object's source text.
         */
        source_text: string | null,

        /**
         * The mapping object's target id.
         */
        target_id: string | null,

        /**
         * The mapping object's target text.
         */
        target_text: string | null,

        /**
         * The mapping object's author.
         */
        author: string | null;

        /**
         * The author's e-mail address.
         */
        authorContact: string | null;

        /**
         * The mapping object's comments.
         */
        comments: string | null;

        /**
         * The mapping object's group.
         */
        group: string | null;
        
    }[]

}
