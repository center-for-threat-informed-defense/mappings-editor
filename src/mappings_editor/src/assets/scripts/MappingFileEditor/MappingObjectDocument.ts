export type MappingObjectDocument = {

    /**
     * The mapping object's id.
     */
    id: string;

    /**
     * The mapping object's source id.
     */
    source_object_id: string | null; 
 
    /**
     * The mapping object's source text.
     */
    source_object_text: string | null;
 
    /**
     * The mapping object's target id.
     */
    target_object_id: string | null; 
 
    /**
     * The mapping object's target text.
     */
    target_object_text: string | null;
 
    /**
     * The mapping object's comments.
     */
    comments: string | null;

}
