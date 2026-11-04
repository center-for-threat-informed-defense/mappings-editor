import type { FrameworkObject } from "../MappingFileAuthority";
import type { MappingObject } from "./MappingObject";

export type MappingProblemType =  "technique_name" | "technique_description" | "technique_removed" | "mitigation_new" | "mitigation_deleted" | "detection_new" | "detection_deleted" | "duplicate"

export type MappingObjectProblem  = {

    /**
     * The problem type associated with the mapping
     * In the future, this could contain more than just attack sync problems
     */
    readonly problemType: MappingProblemType;

    /**
     * The old framework object associated with the mapping (ex. a specific v16 ATT&CK technique)
     */
    readonly oldVersion?: FrameworkObject;

    /**
     * The new framework object associated with the mapping (ex. a specific v17.1 ATT&CK technique)
     */
    readonly newVersion?: FrameworkObject;
    /**
     * Mappings that have been detected as duplicates of the currrent mapping
     */
    readonly duplicateMappings?: MappingObject[];
}
