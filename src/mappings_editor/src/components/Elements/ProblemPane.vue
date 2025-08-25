<template>
    <AccordionBox class="problem-pane-sidebar-element">
    <AccordionPane :units="1" name="Problem Pane" class="pane">
        <ScrollBox class="problem-scrollbox">
            <div class="problem-container">
                <p class="problem-title">VERSION CONTROL</p>
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

export default defineComponent({
    name: "ProblemPane",
    data() {
        return {
            application: useApplicationStore()
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
        AccordionBox,
  }
})
</script>

<style scoped>
.problem-title {
  color: #bfbfbf;
  font-size: 9.5pt;
  font-weight: 500;
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

</style>
