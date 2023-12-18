<template>
  <div class="breakout-section-view-control">
    <div class="breakout-main" @click="toggleCollapse">
      <div class="collapse-icon-container">
        <CollapseArrowLarge class="collapse-icon" :collapsed="view.collapsed"/>
      </div>
      <p class="breakout-name">{{ view.name }}</p>
    </div>
    <div class="create-icon-container" @click="createMappingObject">
      <PlusLarge class="create-icon" />
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { defineComponent, type PropType } from 'vue';
import type { BreakoutSectionView } from "@/assets/scripts/MappingFileEditor";
// Components
import PlusLarge from "../Icons/PlusLarge.vue";
import CollapseArrowLarge from '../Icons/CollapseArrowLarge.vue';

export default defineComponent({
  name: 'BreakoutSectionViewControl',
  props: {
      view: {
        type: Object as PropType<BreakoutSectionView>,
        required: true
      }
  },
  emits: ["execute"],
  methods: {

    /**
     * Creates a new mapping object under the breakout.
     */
    createMappingObject() {
      if(this.view.collapsed) {
        this.$emit("execute", EditorCommands.uncollapseViewItem(this.view));
      }
      this.$emit("execute", EditorCommands.createMappingObjectView(this.view));
    },

    /**
     * Toggles the breakout's collapsed state.
     */
    toggleCollapse() {
      let cmd;
      if(this.view.collapsed) {
        cmd = EditorCommands.uncollapseViewItem(this.view);
      } else {
        cmd = EditorCommands.createGroupCommand(
          EditorCommands.collapseViewItem(this.view),
          EditorCommands.moveCameraToViewItem(this.view.id, this.view.hangHeight)
        )
      }
      this.$emit("execute", cmd);
    }

  },
  components: { PlusLarge, CollapseArrowLarge }
});
</script>

<style scoped>

/** === Main Control === */

.breakout-section-view-control {
  display: flex;
  align-items: center;
  color: #b8b8b8;
  font-size: 10pt;
  font-weight: 500;
  user-select: none;
  border-style: solid none solid solid;
  border-width: 1px;
  border-color: #3b3b3b;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  box-sizing: border-box;
  background: #262626;
  cursor: pointer;
}

/** === Breakout Main === */

.breakout-main {
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;
}

.breakout-main:hover {
  color: #d9d9d9;
}

.breakout-main:hover .collapse-icon {
  fill: #b3b3b3 !important;
}

.collapse-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 100%;
}

.collapse-icon {
  display: block;
}

.breakout-name {
  display: block;
  flex: 1;
}

/** === Create Mapping Icon === */

.create-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 100%;
}

.create-icon-container:hover .create-icon {
  fill: #b3b3b3 !important;
}

</style>
