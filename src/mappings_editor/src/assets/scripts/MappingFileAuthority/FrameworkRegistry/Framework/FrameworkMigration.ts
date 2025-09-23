import type { FrameworkObject } from "./FrameworkObject";

export type FrameworkMigration = {

    /**
     * The list of framework object additions.
     */
    added_framework_objects: FrameworkObject[];

    /**
     * The list of framework object removals.
     */
    removed_framework_objects: FrameworkObject[];

    /**
     * The internal map of changed framework object names.
     */
    changed_names: Map<string, [string, string]>;

    /**
     * The internal map of changed framework object descriptions.
     */
    changed_descriptions: Map<string, [string, string]>;

    /**
     * The internal map of added mitigations to framework objects.
     */
    added_mitigations: Map<string, FrameworkObject[]>;

    /**
     * The internal map of removed mitigations from framework objects.
     */
    removed_mitigations: Map<string, FrameworkObject[]>;

    /**
     * The internal map of added detections to framework objects.
     */
    added_detections: Map<string, FrameworkObject[]>;

    /**
     * The internal map of removed detections from framework objects.
     */
    removed_detections: Map<string, FrameworkObject[]>;
}
