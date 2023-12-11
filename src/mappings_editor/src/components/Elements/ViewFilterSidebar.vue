<template>
  <AccordionBox class="view-filter-sidebar-element">
    <AccordionPane :units="1" name="Organize Mappings" class="pane">
      <ScrollBox class="scrollbox" :propagateScroll="false">
        <p class="control-title">BREAKOUT BY</p>
        <BreakoutController :control="activeView.breakouts" @execute="execute" />
        <template v-if="groupFilters">
          <span class="separator"></span>
          <p class="control-title">FILTER BY GROUP</p>
          <FilterController :control="groupFilters" @execute="execute" />
        </template>
        <template v-if="statusFilters">
          <span class="separator"></span>
          <p class="control-title">FILTER BY STATUS</p>
          <FilterController :control="statusFilters" @execute="execute" />
        </template>
        <template v-if="mappingTypeFilters">
          <span class="separator"></span>
          <p class="control-title">FILTER BY MAPPING TYPE</p>
          <FilterController :control="mappingTypeFilters" @execute="execute" />
        </template>
      </ScrollBox>
    </AccordionPane>
  </AccordionBox>
</template>
  
<script lang="ts">
// Dependencies
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";
import { MappingObjectDiscriminator, type EditorCommand, type FilterControl, type MappingFileView } from "@/assets/scripts/MappingFileEditor";
// Components
import ScrollBox from "../Containers/ScrollBox.vue";
import AccordionBox from "../Containers/AccordionBox.vue";
import AccordionPane from "../Containers/AccordionPane.vue";
import FilterController from "../Controls/Controllers/FilterController.vue";
import BreakoutController from "../Controls/Controllers/BreakoutController.vue";

export default defineComponent({
  name: "ViewFilterSidebar",
  data() {
    return {
      application: useApplicationStore()
    };
  },
  computed: {

    /**
     * Returns the active {@link MappingFileView}.
     * @returns
     *  The active {@link MappingFileView}.
     */
    activeView(): MappingFileView {
      // Have to cast because Pinia seems to struggle with type inference
      return this.application.activeEditor.view as MappingFileView;
    },

    /**
     * Returns the mapping group filters.
     * @returns
     *  The mapping group filters control. `undefined` if there wasn't one.
     */
    groupFilters(): FilterControl | undefined {
      return this.activeView.filterSets.get(MappingObjectDiscriminator.MappingGroup);
    },


    /**
     * Returns the mapping status filters.
     * @returns
     *  The mapping status filters control. `undefined` if there wasn't one.
     */
    statusFilters(): FilterControl | undefined {
      return this.activeView.filterSets.get(MappingObjectDiscriminator.MappingStatus);
    },

    /**
     * Returns the mapping type filters.
     * @returns
     *  The mapping type filters control. `undefined` if there wasn't one.
     */
    mappingTypeFilters(): FilterControl | undefined {
      return this.activeView.filterSets.get(MappingObjectDiscriminator.MappingType);
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
      this.$emit("execute", cmd);
    }

  },
  components: { 
    ScrollBox, AccordionPane,
    AccordionBox, FilterController,
    BreakoutController
  }
});
</script>
  
<style scoped>

/** === Main Element === */

.control-title {
  color: #bfbfbf;
  font-size: 9.5pt;
  font-weight: 500;
  margin: 25px 0px;
}

.scrollbox {
  width: 100%;
  height: 100%;
}

:deep(.scroll-content) {
  padding: 0px 30px 25px;
  box-sizing: border-box;
}

:deep(.scroll-bar) {
  background: #1c1c1c;
  border-left: solid 1px #333333;
}

.separator {
  display: block;
  width: 100%;
  height: 25px;
  border-bottom: solid 1px #333333;
}

</style>
  