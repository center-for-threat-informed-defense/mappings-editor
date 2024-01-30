<template>
  <div class="breakout-section-view-control">
    <div class="breakout-main" @click="toggleCollapse">
      <div class="collapse-icon" :class="{ collapsed: view.collapsed }">
        <svg width="11.314" height="7.0711" viewBox="0 0 2.9934 1.8709">
          <g transform="translate(-.49321 -1.3794)">
            <path
              d="m1.9899 3.2503 1.4967-1.4967-0.37418-0.37418-1.1225 
              1.1225-1.1225-1.1225-0.37418 0.37418 1.1225 1.1225z"
            />
          </g>
        </svg>
      </div>
      <p class="breakout-name">{{ view.name }}</p>
    </div>
    <div class="create-icon" @click="createMappingObject">
      <svg fill="#737373" width="10" height="10" version="1.1" viewBox="0 0 2.6458 2.6458">
        <path d="m1.0583 0v1.0583h-1.0583v0.52917h1.0583v1.0583h0.52917v-1.0583h1.0583v-0.52917h-1.0583v-1.0583z"/>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">

/**
 * Developer's Note:
 * SVGs are directly embedded in this component to improve render performance.
 * Currently, Vue has no way to directly import SVGs without wrapping them in a
 * component.
 */

import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { defineComponent, type PropType } from 'vue';
import type { BreakoutSectionView } from "@/assets/scripts/MappingFileEditor";

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
          EditorCommands.moveCameraToViewItem(this.view, this.view.hangHeight)
        )
      }
      this.$emit("execute", cmd);
    }

  }
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

.breakout-main:hover .collapse-icon svg {
  fill: #b3b3b3 !important;
}

.collapse-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 100%;
}

.collapse-icon svg {
  display: block;
  fill: #8c8c8c;
}

.collapse-icon.collapsed svg { 
  transform: rotate(270deg);
}

.breakout-name {
  display: block;
  flex: 1;
}

/** === Create Mapping Icon === */

.create-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 100%;
}

.create-icon:hover svg {
  fill: #b3b3b3 !important;
}

</style>
