<template>
    <AccordionBox class="problem-pane-sidebar-element">
        <AccordionPane :units="1" name="Problem Pane" class="pane">
            <ScrollBox class="problem-scrollbox">
                <div class="problem-container">
                    <p class="problem-title">VERSION CONTROL</p>

                    <div v-for="change in changes" :key="getProblemKey(change)" class="problem-item">
                        <div class="problem-header">
                            <div class="row">
                                <AlertIcon color="#89a0ec" />
                                <p>Notice</p>
                            </div>

                            <p v-if="change.problemType === 'technique_name'" class="problem-description">
                                {{ getMappingId(change) }} <span>Technique Name</span> has changed between versions
                            </p>
                            <p v-else-if="change.problemType === 'technique_description'" class="problem-description">
                                {{ getMappingId(change) }} <span>Technique Description</span> has changed between versions
                            </p>
                            <p v-else-if="change.problemType === 'mitigation_new'" class="problem-description">
                                {{ getMappingId(change) }} technique had a <span>New Mitigation</span> added between versions
                            </p>
                            <p v-else-if="change.problemType === 'mitigation_deleted'" class="problem-description">
                                {{ getMappingId(change) }} technique had a <span>Mitigation Removed</span> between versions
                            </p>
                            <p v-else-if="change.problemType === 'detection_new'" class="problem-description">
                                {{ getMappingId(change) }} technique has a <span>New Detection</span> added between versions
                            </p>
                            <p v-else-if="change.problemType === 'detection_deleted'" class="problem-description">
                                {{ getMappingId(change) }} technique had a <span>Detection Removed</span> between versions
                            </p>
                            <p v-else-if="change.problemType === 'duplicate'" class="problem-description">
                                <span>{{ getDuplicateCount(change) }}</span>
                                potential duplicate mapping<template v-if="getDuplicateCount(change) !== 1">s</template>
                                {{ getDuplicateCount(change) === 1 ? "has" : "have" }} been detected
                            </p>
                        </div>

                        <template v-if="change.problemType !== 'duplicate'">
                            <VueDiff
                                mode="split"
                                language="plaintext"
                                theme="dark"
                                :prev="getPrev(change)"
                                :current="getCurrent(change)"
                            />
                        </template>

                        <template v-else>
                            <div class="duplicate-merge-container">
                                <div v-if="!change.duplicateMappings || change.duplicateMappings.length === 0" class="duplicate-empty">
                                    <p class="no-changes">No duplicate mappings were attached to this problem.</p>
                                </div>

                                <div v-else class="duplicate-merge-panel">
                                    <div class="duplicate-panel-top">
                                        <p class="duplicate-summary-subtext">
                                            Select a mapping below to inspect it, then choose which source to keep for each differing field.
                                        </p>

                                        <div class="top-actions">
                                            <button
                                                class="merge-button primary"
                                                @click="applyProblemDuplicateMerge(change)"
                                            >
                                                Apply Merge
                                            </button>
                                        </div>
                                    </div>

                                    <div class="mapping-selector-row">
                                        <button
                                            v-for="option in getSourceOptions(change)"
                                            :key="`inspect-${getProblemKey(change)}-${option.key}`"
                                            class="merge-button"
                                            :class="{ active: getInspectedSource(change) === option.key }"
                                            @click="inspectMappingSource(change, option.key)"
                                        >
                                            {{ option.label }}
                                        </button>
                                    </div>

                                    <div v-if="getProblemDuplicateDiffs(change).length === 0" class="duplicate-empty">
                                        <p class="no-changes">No field-level differences found between these mappings.</p>
                                    </div>

                                    <div
                                        v-for="field in getProblemDuplicateDiffs(change)"
                                        :key="`${getProblemKey(change)}-${field.key}`"
                                        class="merge-field"
                                    >
                                        <div class="merge-field-header">
                                            <p class="merge-field-title">{{ field.label }}</p>
                                        </div>

                                        <div class="merge-choice-row">
                                            <button
                                                v-for="option in getSourceOptions(change)"
                                                :key="`choice-${getProblemKey(change)}-${field.key}-${option.key}`"
                                                class="merge-button small"
                                                :class="{ active: getMergeChoice(change, field.key) === option.key }"
                                                @click="setMergeChoice(change, field.key, option.key)"
                                            >
                                                Use {{ option.label }}
                                            </button>
                                        </div>

                                        <div
                                            class="merge-values-grid"
                                            :style="{ gridTemplateColumns: `repeat(${getSourceOptions(change).length}, minmax(0, 1fr))` }"
                                        >
                                            <div
                                                v-for="option in getSourceOptions(change)"
                                                :key="`value-${getProblemKey(change)}-${field.key}-${option.key}`"
                                                class="merge-value-column"
                                                :class="{ selected: getMergeChoice(change, field.key) === option.key }"
                                            >
                                                <p class="merge-value-label">{{ option.label }}</p>
                                                <div class="merge-value-content">
                                                    {{ field.values[option.key] || "—" }}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="merge-preview">
                                            <p>
                                                Selected result:
                                                <span>{{ getMergedPreviewValue(change, field) || "—" }}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <div v-if="changes.length < 1">
                        <p class="no-changes">No version changes detected for this mapping</p>
                    </div>
                </div>
            </ScrollBox>
        </AccordionPane>
    </AccordionBox>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useApplicationStore } from "../../stores/ApplicationStore";
import ScrollBox from "../Containers/ScrollBox.vue";
import AccordionBox from "../Containers/AccordionBox.vue";
import AccordionPane from "../Containers/AccordionPane.vue";
import AlertIcon from "../Icons/AlertIcon.vue";
import type { MappingObjectProblem } from "../../assets/scripts/MappingFile/MappingObjectProblem";
import type { MappingObject } from "../../assets/scripts/MappingFile/MappingObject";
import * as EditorCommands from "../../assets/scripts/MappingFileEditor/EditorCommands";
import type { EditorCommand } from "../../assets/scripts/MappingFileEditor";
import type { MergeFieldSelection } from "@/assets/scripts/MappingFileEditor/EditorCommands/File/MergeMappingsObject";

type MergeSourceKey = string;

type SourceOption = {
    key: MergeSourceKey;
    label: string;
    mapping: MappingObject | undefined;
};

type DuplicateFieldDiff = {
    key: string;
    label: string;
    values: Record<string, string>;
};

const DUPLICATE_MERGE_FIELDS: Array<{ key: keyof MappingObject | string; label: string }> = [
    { key: "sourceObject", label: "Source Object" },
    { key: "targetObject", label: "Target Object" },
    { key: "capabilityGroup", label: "Capability Group" },
    { key: "mappingType", label: "Mapping Type" },
    { key: "mappingStatus", label: "Mapping Status" },
    { key: "author", label: "Author" },
    { key: "authorContact", label: "Author Contact" },
    { key: "authorOrganization", label: "Author Organization" },
    { key: "references", label: "References" },
    { key: "comments", label: "Comments" },
    { key: "scoreCategory", label: "Score Category" },
    { key: "scoreValue", label: "Score Value" }
];

export default defineComponent({
    name: "ProblemPane",
    components: {
        ScrollBox,
        AccordionPane,
        AccordionBox,
        AlertIcon
    },
    emits: ["execute"],
    data() {
        return {
            application: useApplicationStore(),
            mergeSelections: {} as Record<string, Record<string, MergeSourceKey>>,
            inspectedSources: {} as Record<string, MergeSourceKey>
        };
    },
    computed: {
        changes(): MappingObjectProblem[] {
            const problems: MappingObjectProblem[] = [];
            const selected = Array.from(this.application.activeEditor.view.selected);
            const mappingsList = this.application.activeEditor.file.mappingObjects;

            selected.forEach(mappingId => {
                const mappingObject = mappingsList.get(mappingId);
                if (mappingObject && mappingObject.problems.length > 0) {
                    problems.push(...mappingObject.problems);
                }
            });

            return problems;
        },

        currentMapping(): MappingObject | undefined {
            const mappingId = Array.from(this.application.activeEditor.view.selected)[0];
            const mappingsList = this.application.activeEditor.file.mappingObjects;
            return mappingsList.get(mappingId);
        }
    },
    watch: {
        currentMapping(newValue, oldValue) {
            if (newValue?.id !== oldValue?.id) {
                this.mergeSelections = {};
                this.inspectedSources = {};
            }
        }
    },
    methods: {
        /**
     * Executes an {@link EditorCommand}.
     * @param cmd
     *  The command to execute.
     */
    execute(cmd: EditorCommand) {
      this.$emit("execute", cmd);
    },
        getProblemKey(problem: MappingObjectProblem): string {
            if (problem.problemType === "duplicate") {
                const duplicateIds = problem.duplicateMappings?.map(m => m.id).join(",") ?? "none";
                return `${problem.problemType}-${duplicateIds}`;
            }

            return `${problem.problemType}-${problem.newVersion?.id ?? "none"}-${problem.oldVersion?.id ?? "none"}`;
        },

        getDuplicateCount(problem: MappingObjectProblem): number {
            return problem.duplicateMappings?.length ?? 0;
        },

        getMappingId(problem: MappingObjectProblem): string {
            if (problem.newVersion) {
                return problem.newVersion.id + "'s";
            } else if (problem.oldVersion) {
                return problem.oldVersion.id + "'s";
            }
            return "This mapping's";
        },

        getPrev(problem: MappingObjectProblem): string {
            if (problem.oldVersion) {
                if (problem.problemType === "technique_description") {
                    return problem.oldVersion.description;
                } else if (problem.problemType === "technique_name") {
                    return problem.oldVersion.name;
                } else if (problem.problemType === "mitigation_deleted") {
                    return problem.oldVersion.description;
                } else if (problem.problemType === "detection_deleted") {
                    return problem.oldVersion.description;
                }
            }
            return "";
        },

        getCurrent(problem: MappingObjectProblem): string {
            if (problem.newVersion) {
                if (problem.problemType === "technique_description") {
                    return problem.newVersion.description;
                } else if (problem.problemType === "technique_name") {
                    return problem.newVersion.name;
                } else if (problem.problemType === "mitigation_new") {
                    return problem.newVersion.description;
                } else if (problem.problemType === "detection_new") {
                    return problem.newVersion.description;
                }
            }
            return "";
        },

        normalizeValue(value: string): string {
            return value.replace(/\r\n/g, "\n").trim();
        },

        getReadableValue(value: unknown): string {
            if (value === null || value === undefined) {
                return "";
            }

            if (typeof value === "string") {
                return value;
            }

            if (typeof value === "number" || typeof value === "boolean") {
                return String(value);
            }

            if (Array.isArray(value)) {
                return value
                    .map(item => this.getReadableValue(item))
                    .filter(Boolean)
                    .join("\n");
            }

            if (typeof value === "object") {
                const obj = value as Record<string, unknown>;

                if ("exportValue" in obj) {
                    return this.getReadableValue(obj.exportValue);
                }

                if ("value" in obj) {
                    return this.getReadableValue(obj.value);
                }

                if ("url" in obj && typeof obj.url === "string") {
                    return obj.url;
                }

                if ("id" in obj && "name" in obj && typeof obj.id === "string" && typeof obj.name === "string") {
                    return `${obj.id} - ${obj.name}`;
                }

                if ("name" in obj && typeof obj.name === "string") {
                    return obj.name;
                }

                try {
                    return JSON.stringify(value, null, 2);
                } catch {
                    return String(value);
                }
            }

            return String(value);
        },

        getMappingFieldText(mapping: MappingObject | undefined, fieldKey: string): string {
            if (!mapping) {
                return "";
            }

            const value = (mapping as Record<string, unknown>)[fieldKey];
            return this.getReadableValue(value);
        },

        getDuplicateSourceKey(duplicateId: string): string {
            return `duplicate:${duplicateId}`;
        },

        getDuplicateLabel(index: number, totalDuplicates: number): string {
            return totalDuplicates === 1 ? "Duplicate" : `Duplicate ${index + 1}`;
        },

        getSourceOptions(problem: MappingObjectProblem): SourceOption[] {
            const duplicates = problem.duplicateMappings ?? [];
            const options: SourceOption[] = [
                {
                    key: "current",
                    label: "Current",
                    mapping: this.currentMapping
                }
            ];

            duplicates.forEach((duplicate, index) => {
                options.push({
                    key: this.getDuplicateSourceKey(duplicate.id),
                    label: this.getDuplicateLabel(index, duplicates.length),
                    mapping: duplicate
                });
            });

            return options;
        },

        getProblemDuplicateDiffs(problem: MappingObjectProblem): DuplicateFieldDiff[] {
            const sourceOptions = this.getSourceOptions(problem);

            return DUPLICATE_MERGE_FIELDS
                .map(field => {
                    const values: Record<string, string> = {};

                    sourceOptions.forEach(option => {
                        values[option.key] = this.getMappingFieldText(option.mapping, field.key);
                    });

                    return {
                        key: String(field.key),
                        label: field.label,
                        values
                    };
                })
                .filter(field => {
                    const uniqueValues = new Set(
                        Object.values(field.values).map(value => this.normalizeValue(value))
                    );
                    return uniqueValues.size > 1;
                });
        },

        ensureProblemSelectionState(problemKey: string): void {
            if (!this.mergeSelections[problemKey]) {
                this.mergeSelections[problemKey] = {};
            }
        },

        getMergeChoice(problem: MappingObjectProblem, fieldKey: string): MergeSourceKey {
            const problemKey = this.getProblemKey(problem);
            return this.mergeSelections[problemKey]?.[fieldKey] ?? "current";
        },

        setMergeChoice(problem: MappingObjectProblem, fieldKey: string, sourceKey: MergeSourceKey): void {
            const problemKey = this.getProblemKey(problem);
            this.ensureProblemSelectionState(problemKey);
            this.mergeSelections[problemKey][fieldKey] = sourceKey;
        },

        getMergedPreviewValue(problem: MappingObjectProblem, field: DuplicateFieldDiff): string {
            const sourceKey = this.getMergeChoice(problem, field.key);
            return field.values[sourceKey] ?? "";
        },

        getInspectedSource(problem: MappingObjectProblem): MergeSourceKey {
            const problemKey = this.getProblemKey(problem);
            return this.inspectedSources[problemKey] ?? "current";
        },

        inspectMappingSource(problem: MappingObjectProblem, sourceKey: MergeSourceKey): void {
            const problemKey = this.getProblemKey(problem);
            this.inspectedSources[problemKey] = sourceKey;

            const sourceOption = this.getSourceOptions(problem).find(option => option.key === sourceKey);
            if (!sourceOption?.mapping) {
                return;
            }
            //  TODO: is it weird that we deselect the last selection?
            // Scroll to the selected mapping
            this.application.activeEditor.view.setAllItemsSelect(false);
            this.application.activeEditor.view.setItemSelect(sourceOption.mapping.id, true);
            this.application.activeEditor.view.moveToViewItem(sourceOption.mapping.id, 0, false, true);
        },

        applyProblemDuplicateMerge(problem: MappingObjectProblem): void {
            if (!this.currentMapping) {
                return;
            }

            const diffs = this.getProblemDuplicateDiffs(problem);


            const fieldSelections: MergeFieldSelection[] = diffs.map(field => {
                const sourceKey = this.getMergeChoice(problem, field.key);
                return {
                    fieldKey: field.key as keyof MappingObject,
                    sourceKey: field.key as keyof MappingObject,
                    duplicateMappingId: sourceKey.startsWith("duplicate:")
                        ? sourceKey.replace("duplicate:", "")
                        : undefined
                };
            });

            let command = EditorCommands.mergeMappingsObject(
                this.currentMapping,
                problem.duplicateMappings ?? [],
                fieldSelections
            );
            this.$emit("execute", command);



            // TODO:
            // Replace this emit with your real merge command/store action.
            // That implementation will likely need to:
            // 1. For each field, copy the selected source value into the current mapping
            // 2. Resolve/remove the duplicate problem on the current mapping
            // 3. Resolve/remove duplicate problems on all duplicate mappings
            // 4. Optionally delete/archive/mark duplicate mappings as merged
            // 5. Persist changes and hook into undo/redo
        }
    }
});
</script>

<style scoped>
.problem-item {
    margin-bottom: 10px;
}

.problem-header {
    background-color: #242424;
    border-radius: 5px 5px 0px 0px;
    color: #bfbfbf;
    padding: 16px 10px 0px 10px;
}

.problem-header .row {
    font-size: 14px;
    display: flex;
    flex-wrap: wrap;
    font-weight: 500;
    color: #89a0ec;
    gap: 10px;
}

.problem-description {
    padding-top: 6px;
    font-size: 12px;
}

.problem-description span {
    color: #89a0ec;
    font-weight: 600;
}

.problem-title {
    color: #bfbfbf;
    font-size: 9.5pt;
    font-weight: 600;
    margin: 25px 0px;
}

.problem-scrollbox {
    width: 100%;
    height: 100%;
}

.problem-scrollbox :deep(.scroll-bar) {
    background: #1c1c1c;
    border-left: solid 1px #333333;
}

.problem-container {
    padding: 0px 30px 25px;
    box-sizing: border-box;
}

.problem-pane-sidebar-element {
    width: 100%;
}

.vue-diff-theme-dark {
    background-color: #242424;
}

.no-changes {
    color: #b8b8b8;
    font-size: 10pt;
    font-weight: 500;
}

.duplicate-merge-container {
    background-color: #242424;
    border-radius: 0px 0px 5px 5px;
    padding: 12px;
}

.duplicate-merge-panel {
    border: solid 1px #333333;
    border-radius: 5px;
    overflow: hidden;
    background-color: #1f1f1f;
}

.duplicate-panel-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 12px;
    border-bottom: solid 1px #333333;
    background-color: #202020;
}

.duplicate-summary-subtext {
    margin: 0;
    color: #9b9b9b;
    font-size: 11px;
}

.top-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.mapping-selector-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    border-bottom: solid 1px #333333;
    background-color: #1d1d1d;
}

.duplicate-empty {
    padding: 12px;
}

.merge-field {
    padding: 12px;
    border-top: solid 1px #2d2d2d;
}

.merge-field:first-of-type {
    border-top: none;
}

.merge-field-header {
    margin-bottom: 10px;
}

.merge-field-title {
    margin: 0;
    color: #dcdcdc;
    font-size: 12px;
    font-weight: 600;
}

.merge-choice-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
}

.merge-values-grid {
    display: grid;
    gap: 8px;
}

.merge-value-column {
    min-width: 0;
    border: solid 1px #333333;
    border-radius: 5px;
    background-color: #242424;
    overflow: hidden;
}

.merge-value-column.selected {
    border-color: #637bc9;
    box-shadow: inset 0 0 0 1px #637bc9;
}

.merge-value-label {
    margin: 0;
    padding: 8px 10px;
    color: #8f8f8f;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: solid 1px #333333;
    background-color: #202020;
}

.merge-value-content {
    min-height: 70px;
    padding: 10px;
    color: #d0d0d0;
    font-size: 11px;
    white-space: pre-wrap;
    word-break: break-word;
}

.merge-preview {
    margin-top: 8px;
    padding: 8px 10px;
    background-color: #202020;
    border: solid 1px #2f2f2f;
    border-radius: 4px;
}

.merge-preview p {
    margin: 0;
    color: #cfcfcf;
    font-size: 11px;
}

.merge-preview span {
    color: #89a0ec;
    font-weight: 600;
    white-space: pre-wrap;
}

.merge-button {
    padding: 7px 10px;
    border-radius: 4px;
    border: solid 1px #3a3a3a;
    background: #242424;
    color: #d0d0d0;
    cursor: pointer;
    font-size: 11px;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.merge-button:hover {
    border-color: #637bc9;
    color: #ffffff;
}

.merge-button.active {
    background-color: #637bc9;
    border-color: #637bc9;
    color: #ffffff;
}

.merge-button.primary {
    background-color: #637bc9;
    border-color: #637bc9;
    color: #ffffff;
}

.merge-button.small {
    padding: 5px 8px;
    font-size: 10px;
}
</style>
