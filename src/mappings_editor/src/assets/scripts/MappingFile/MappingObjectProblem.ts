import type { FrameworkObject } from "../MappingFileAuthority";

export type MappingProblemType =  "technique_name" | "technique_description" | "technique_removed" | "mitigation_new" | "mitigation_deleted"

export type MappingObjectProblem  = {

    /**
     * The mapping object's id.
     */
    readonly mappingId: string;

    /**
     * The problem type associated with the mapping
     * In the future, this could contain more than just attack sync problems
     */
    readonly problemType: MappingProblemType;

    readonly oldVersion: FrameworkObject;

    readonly newVersion: FrameworkObject;

}
