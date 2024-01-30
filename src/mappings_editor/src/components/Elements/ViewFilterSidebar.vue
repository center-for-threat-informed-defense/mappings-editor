<template>
  <AccordionBox class="view-filter-sidebar-element">
    <AccordionPane :units="1" name="Organize Mappings" class="pane">
      <ScrollBox class="control-scrollbox">
        <div class="control-container">
          <p class="control-title">BREAKOUT BY</p>
          <BreakoutController :control="activeView.breakouts" @execute="execute" />
          
          <template v-if="mappingGroupFilters">
            <span class="separator"></span>
            <p class="control-title">FILTER BY GROUP</p>
            <FilterController :control="mappingGroupFilters" @execute="execute" />
          </template>
          <template v-if="mappingStatusFilters">
            <span class="separator"></span>
            <p class="control-title">FILTER BY STATUS</p>
            <FilterController :control="mappingStatusFilters" @execute="execute" />
          </template>
          <template v-if="mappingTypeFilters">
            <span class="separator"></span>
            <p class="control-title">FILTER BY MAPPING TYPE</p>
            <FilterController :control="mappingTypeFilters" @execute="execute" />
          </template>
          <template v-if="sourceObjectFilters">
            <span class="separator"></span>
            <p class="control-title">FILTER BY SOURCE</p>
            <FilterController :control="sourceObjectFilters" @execute="execute" />
          </template>
          <template v-if="targetObjectFilters">
            <span class="separator"></span>
            <p class="control-title">FILTER BY TARGET</p>
            <FilterController :control="targetObjectFilters" @execute="execute" />
          </template>
          <template v-if="validityFilters">
            <span class="separator"></span>
            <p class="control-title">FILTER BY VALIDITY</p>
            <FilterController :control="validityFilters" @execute="execute" />
          </template>
        </div>
      </ScrollBox>
    </AccordionPane>
  </AccordionBox>
</template>
  
<script lang="ts">
// Dependencies
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";
import { MappingObjectDiscriminator } from "@/assets/scripts/MappingFileEditor";
import type { EditorCommand, FilterControl, MappingFileView } from "@/assets/scripts/MappingFileEditor";
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
    mappingGroupFilters(): FilterControl | undefined {
      return this.activeView.filterSets.get(MappingObjectDiscriminator.MappingGroup);
    },

    /**
     * Returns the mapping status filters.
     * @returns
     *  The mapping status filters control. `undefined` if there wasn't one.
     */
    mappingStatusFilters(): FilterControl | undefined {
      return this.activeView.filterSets.get(MappingObjectDiscriminator.MappingStatus);
    },

    /**
     * Returns the mapping type filters.
     * @returns
     *  The mapping type filters control. `undefined` if there wasn't one.
     */
    mappingTypeFilters(): FilterControl | undefined {
      return this.activeView.filterSets.get(MappingObjectDiscriminator.MappingType);
    },

    /**
     * Returns the source object filters.
     * @returns
     *  The source object filters control. `undefined` if there wasn't one.
     */
    sourceObjectFilters(): FilterControl | undefined {
      return this.activeView.filterSets.get(MappingObjectDiscriminator.SourceObject);
    },

    /**
     * Returns the target object filters.
     * @returns
     *  The target object filters control. `undefined` if there wasn't one.
     */
    targetObjectFilters(): FilterControl | undefined {
      return this.activeView.filterSets.get(MappingObjectDiscriminator.TargetObject);
    },

    /**
     * Returns the validity filters.
     * @returns
     *  The validity filters control. `undefined` if there wasn't one.
     */
    validityFilters(): FilterControl | undefined {
      return this.activeView.filterSets.get(MappingObjectDiscriminator.IsValid);
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

.control-scrollbox {
  width: 100%;
  height: 100%;
}

.control-scrollbox :deep(.scroll-bar) {
  background: #1c1c1c;
  border-left: solid 1px #333333;
}

.control-container {
  padding: 0px 30px 25px;
  box-sizing: border-box;
}

.separator {
  display: block;
  width: 100%;
  height: 25px;
  border-bottom: solid 1px #333333;
}

</style>
