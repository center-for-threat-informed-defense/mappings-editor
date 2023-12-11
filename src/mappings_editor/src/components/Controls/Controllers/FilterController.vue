<template>
  <div class="">
    <div class="filter-controller">
      <CheckboxBar
        class="checkbox-bar"
        text="SHOW ALL"
        :checked="control.allShown()"
        @click="onClickShowAll"
      />
      <CheckboxBar
        v-for="[id, text] of control.options"
        class="checkbox-bar"
        :key="id ?? 'null'"
        :text="text"
        :checked="isFilterChecked(id)"
        @click="onClickFilter(id)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
// Dependencies
import { defineComponent, type PropType } from "vue";
import type { FilterControl } from "@/assets/scripts/MappingFileEditor";
// Components
import CheckboxBar from "./CheckboxBar.vue";

export default defineComponent({
  name: "TabularField",
  props: {
    control: {
      type: Object as PropType<FilterControl>,
      required: true
    }
  },
  emits: ["execute"],
  methods: {

    /**
     * Show all click behavior.
     */
    onClickShowAll() {
      if(!this.control.allShown()) {
        this.$emit("execute", EditorCommands.showAllItems(this.control));
      }
    },

    /**
     * Filter click behavior.
     * @param id
     *  The filter's id.
     */
    onClickFilter(id: string | null) {
      let cmd;
      if(this.isFilterChecked(id)) {
        cmd = EditorCommands.removeFilter(this.control, id);
      } else {
        cmd = EditorCommands.applyFilter(this.control, id);
      }
      this.$emit("execute", cmd);
    },

    /**
     * Tests if a filter is checked.
     * @param id
     *  The filter's id.
     * @returns
     *  True if the filter is checked, false otherwise.
     */
    isFilterChecked(id: string | null): boolean {
      return this.control.isShown(id) && !this.control.allShown();
    }
    
  },
  components: { CheckboxBar }
});
</script>

<style scoped>

/** === Main Control === */

.filter-controller {
  width: 100%;
}

.checkbox-bar {
  height: 29px;
  margin-bottom: 8px;
  cursor: pointer;
}

.checkbox-bar:last-child {
  margin-bottom: 0px;
}

</style>
