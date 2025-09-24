<template>
    <AccordionBox class="problem-pane-sidebar-element">
        <AccordionPane :units="1" name="Problem Pane" class="pane">
            <ScrollBox class="problem-scrollbox">
                <div class="problem-container">
                    <p class="problem-title">VERSION CONTROL</p>
                    <div v-for="change in changes" :key="change.problemType" class="problem-item">
                        <div class="problem-header">
                            <div class="row">
                                <AlertIcon color="#89a0ec"/>
                                <p>Notice</p>
                            </div>
                            <!-- todo: add old version somewhere so we can say "between version 1 and version 2"? -->
                            <p v-if="change.problemType === 'technique_name'" class="problem-description">{{ getMappingId(change) }} <span>Technique Name</span> has changed between versions</p>
                            <p v-if="change.problemType === 'technique_description'" class="problem-description">{{ getMappingId(change) }} <span>Technique Description</span> has changed between versions</p>
                            <p v-if="change.problemType === 'mitigation_new'" class="problem-description">{{ getMappingId(change) }} technique had a <span>New Mitigation</span> added between versions</p>
                            <p v-if="change.problemType === 'mitigation_deleted'" class="problem-description">{{ getMappingId(change) }} technique had a <span>Mitigation Removed</span> between versions</p>
                            <p v-if="change.problemType === 'detection_new'" class="problem-description">{{ getMappingId(change) }} technique has a <span>New Detection</span> added between versions</p>
                            <p v-if="change.problemType === 'detection_deleted'" class="problem-description">{{ getMappingId(change) }} technique had a <span>Detection Removed</span> between versions</p>
                        </div>
                        <VueDiff mode="split" language="plaintext" theme="dark"
                            :prev="getPrev(change)"
                            :current="getCurrent(change)" />
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
import type { EditorCommand } from "../../assets/scripts/MappingFileEditor";
import ScrollBox from "../Containers/ScrollBox.vue";
import AccordionBox from "../Containers/AccordionBox.vue";
import AccordionPane from "../Containers/AccordionPane.vue";
import AlertIcon from "../Icons/AlertIcon.vue";
import type { MappingObjectProblem } from "../../assets/scripts/MappingFile/MappingObjectProblem";

export default defineComponent({
    name: "ProblemPane",
    data() {
        return {
            application: useApplicationStore(),
        }
    },
    emits: ["execute"],
    methods: {
        /**
         * Executes an {@link EditorCommand}.
         * @param cmd
         *  The command to execute.
         * todo: can this be deleted?
         */
        execute(cmd: EditorCommand) {
            this.$emit("execute", cmd);
        },
        getMappingId(problem: MappingObjectProblem): string {
            if (problem.newVersion) {
                return problem.newVersion.id + "'s"
            } else if (problem.oldVersion) {
                return problem.oldVersion.id + "'s"
            }
            return "This mapping's"
        },
        getPrev(problem: MappingObjectProblem): string {
            if ( problem.oldVersion) {
                if (problem.problemType === "technique_description") {
                    return problem.oldVersion.description;
                } else if (problem.problemType === "technique_name") {
                    return problem.oldVersion?.name;
                } else if (problem.problemType === "mitigation_deleted") {
                    return problem.oldVersion?.description;
                }else if (problem.problemType === "detection_deleted") {
                    return problem.oldVersion?.description;
                }
            }

            return ""
        },
        getCurrent(problem: MappingObjectProblem): string {
            if ( problem.newVersion) {
                if (problem.problemType === "technique_description") {
                    return problem.newVersion?.description;
                } else if (problem.problemType === "technique_name") {
                    return problem.newVersion?.name;
                } else if (problem.problemType === "mitigation_new") {
                    return problem.newVersion?.description;
                } else if (problem.problemType === "detection_new") {
                    return problem.newVersion?.description;
                }
            }
            return ""
        }
    },
    computed: {
        changes() {
            // Build list of problems to display out of current mapping selection
            const problems: MappingObjectProblem[] = [];
            const selected = Array.from(this.application.activeEditor.view.selected);
            const mappingsList = this.application.activeEditor.file.mappingObjects;
            selected.forEach(mappingId =>{
                const mappingObject = mappingsList.get(mappingId);
                if (mappingObject && mappingObject.problems.length > 0) {
                    problems.push(...mappingObject.problems)
                }
            })
            return problems;
        }
    },
    components: {
        ScrollBox, AccordionPane,
        AccordionBox, AlertIcon
    }
})
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

.menu-button {
    padding: 10px;
    width: 50px;
    height: 50px;
    text-align: center;
    border-radius: 3px;
    box-sizing: border-box;
    border: solid 1px #333333;
    background: #242424;
    cursor: pointer;
}

.menu-button.active {
    background-color: #637bc9;
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
</style>
