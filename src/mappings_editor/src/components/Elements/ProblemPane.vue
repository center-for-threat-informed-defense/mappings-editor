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
                            <p v-if="change.problemType === 'technique_description'" class="problem-description">This mapping's <span>Technique Description</span> has changed between versions 12.1 and 14.1</p>
                            <p v-if="change.problemType === 'mitigation_new'" class="problem-description">This mapping's technnique has a <span>New Mitigation</span> added between versions 12.1 and 14.1</p>
                            <p v-if="change.problemType === 'mitigation_deleted'" class="problem-description">This mapping's <span>Technique Description</span> has changed between versions 12.1 and 14.1</p>
                        </div>
                        <VueDiff mode="split" language="plaintext" theme="dark"
                            :prev="change.oldVersion"
                            :current="change.newVersion" />
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

export default defineComponent({
    name: "ProblemPane",
    data() {
        return {
            application: useApplicationStore(),
            changes: [{
                problemType: "technique_description",
                oldVersion: "this is the previous sentence to see the difference. Deleted.",
                newVersion: "this is the new sentence to see the difference. This part wasn't there",
            },{
                problemType: "mitigation_new",
                oldVersion: "",
                newVersion: "this is the new sentence to see the difference. This part wasn't there",
            }]
        }
    },
    emits: ["execute"],
    methods: {
        /**
         * Executes an {@link EditorCommand}.
         * @param cmd
         *  The command to execute.
         */
        execute(cmd: EditorCommand) {
            console.log("fire execute from problempane", cmd);
            this.$emit("execute", cmd);
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
</style>
