import type { MappingObjectExport } from "./MappingObjectExport";
import type { CapabilityGroupsExport } from "./CapabilityGroupsExport";
import type { MappingTypesExport } from "./MappingTypesExport";
import type { MappingStatusesExport } from "./MappingStatusesExport";
import type { MappingScoreValuesExport } from "./ScoreValuesExport";
import type { MappingScoreCategoriesExport } from "./ScoreCategoriesExport";

export type MappingFileExport = {

    /**
     * The file's version.
     */
    version: string;

    /**
     * The file's source framework.
     */
    source_framework: string;

    /**
     * The file's source framework version.
     */
    source_version: string;

    /**
     * The file's target framework.
     */
    target_framework: string;

    /**
     * The file's target framework version.
     */
    target_version: string;

    /**
     * The file's author.
     */
    author: string | null;

    /**
     * The author's e-mail.
     */
    author_contact: string | null;

    /**
     * The author's organization.
     */
    author_organization: string | null;

    /**
     * The file's creation date.
     */
    creation_date: Date;

    /**
     * The file's last modified date.
     */
    modified_date: Date;

    /**
     * The file's capability groups.
     */
    capability_groups: CapabilityGroupsExport;

    /**
     * The file's mapping types.
     */
    mapping_types: MappingTypesExport;

    /**
     * The file's mapping statuses.
     */
    mapping_statuses: MappingStatusesExport

    /**
     * The file's score categories.
     */
    score_categories: MappingScoreCategoriesExport;

    /**
     * The file's score values.
     */
    score_values: MappingScoreValuesExport;

    /**
     * The file's objects.
     */
    mapping_objects: MappingObjectExport[];

    /**
     * The file's default mapping status.
     */
    default_mapping_status?: string | null;

    /**
     * The file's default mapping type.
     */
    default_mapping_type?: string | null;

}
