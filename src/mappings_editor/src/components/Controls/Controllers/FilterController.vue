<template>
  <div class="">
    <div class="filter-controller">
      <div class="checkbox-container">
        <CheckboxBar 
          class="checkbox-bar" 
          text="SHOW ALL"
          :checked="control.allShown()"
          @click="onClickShowAll"
        />
      </div>
      <template v-for="[id, text] of listedFilters" :key="id ?? 'null'">
        <div class="checkbox-container">
          <CheckboxBar
            class="checkbox-bar"
            :text="text"
            :checked="isFilterChecked(id)"
            @click="onClickFilter(id)"
          />
          <div class="drop-filter" @click="onDropFilter(id)" v-if="enterEditMode">
            ✗
          </div>
        </div>
      </template>
      <div 
        :class="['checkbox-container', 'new-filter', { active: showOptions }]"
        v-if="isNewFilterShown"
      >
          <div class="search-container">
            <OptionsList 
              ref="optionsList"
              class="options-list"
              :select="select"
              :options="searchOptions"
              :maxHeight="maxHeight"
              @hover="value => select = value"
              @select="applyFilter"
              v-if="showOptions"
            />
            <input 
              type="text" 
              ref="search"
              name="search"
              class="filter-search"
              placeholder="Add Filter..."
              @input="onSearchInput"
              @focusin="onSearchFocusIn"
              @focusout="onSearchFocusOut"
              @keyup.stop=""
              @keydown.stop="onSearchKeyDown"
              v-model="searchTerm"
            />
          </div>
          <div class="drop-filter">
            ✗
          </div>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
// Dependencies
import { unsignedMod } from "@/assets/scripts/Utilities";
import { defineComponent, type PropType } from "vue";
import type { FilterControl } from "@/assets/scripts/MappingFileEditor";
// Components
import CheckboxBar from "./CheckboxBar.vue";
import OptionsList from "../Fields/OptionsList.vue";

export default defineComponent({
  name: "FilterController",
  props: {
    control: {
      type: Object as PropType<FilterControl>,
      required: true
    },
    enableEditMode: {
      type: Boolean,
      default: false
    },
    maxFilters: {
      type: Number,
      default: 10
    },
    maxHeight: {
      type: Number,
      default: 195
    }
  },
  data() {
    return {
      select: null as string | null,
      searchTerm: "",
      showOptions: false,
      enterEditMode: this.enableEditMode,
      listedFilters: new Map(),
    }
  },
  computed: {

    /**
     * Returns the filter search options.
     * @returns
     *  The filter search options.
     */
    searchOptions(): { value: string | null, text: string }[] {
      let options: { value: string | null, text: string }[] = [];
      let st = this.searchTerm.toLocaleLowerCase();
      for(let [value, text] of this.control.options) {
        const isVisible = this.listedFilters.has(value);
        const textMatch = text.toLocaleLowerCase().includes(st);
        if(!isVisible && (st === "" || textMatch)) {
          options.push({ value, text });
        }
      }
      return options;
    },

    /**
     * Tests if the new filter field is shown.
     * @returns
     *  True if it's shown, false otherwise.
     */
    isNewFilterShown(): boolean {
      return this.enterEditMode && this.control.size !== this.listedFilters.size;
    }

  },
  emits: ["execute"],
  methods: {

    /**
     * Tests if a filter is checked.
     * @param id
     *  The filter's id.
     * @returns
     *  True if the filter is checked, false otherwise.
     */
    isFilterChecked(id: string | null): boolean {
      return this.control.isShown(id) && !this.control.allShown();
    },

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
     * Filter drop click behavior.
     * @param id
     *  The filter's id.
     */
    onDropFilter(id: string | null) {
      if(this.isFilterChecked(id)) {
        this.$emit("execute", EditorCommands.removeFilter(this.control, id));
      }
      this.listedFilters.delete(id);
    },


    /**
     * Search focus in behavior.
     */
    onSearchFocusIn() {
      // Update select
      if(this.searchOptions.length) {
        this.select = this.searchOptions[0].value;
      } else {
        this.select = null;
      }
      // Show options
      this.showOptions = true;
    },

    /**
     * Search focus out behavior.
     */
    onSearchFocusOut() {
      // Close options
      this.showOptions = false;
      // Clear search
      this.searchTerm = "";
    },

    /**
     * Search input behavior.
     */
    onSearchInput() {
      // Update select
      if(this.searchOptions.length) {
        this.select = this.searchOptions[0].value;
      } else {
        this.select = null;
      }
      // Focus selection
      let optionsList = this.$refs.optionsList as any;
      optionsList?.focusItemTop(this.select);
    },

    /**
     * Search keydown behavior.
     * @param event
     *  The keydown event.
     */
     onSearchKeyDown(event: KeyboardEvent) {
      let idx;
      let options = this.searchOptions;
      let optionsList = this.$refs.optionsList as any;
      switch(event.key) {
        case "ArrowUp":
          if(!options.length) {
            return;
          }
          event.preventDefault();
          // Resolve index
          idx = options.findIndex(o => o.value === this.select);
          idx = unsignedMod(idx - 1, options.length);
          // Update selection
          this.select = options[idx].value;
          optionsList?.bringItemIntoFocus(this.select);
          break;
        case "ArrowDown":
          if(!options.length) { 
            return;
          }
          event.preventDefault();
          // Resolve index
          idx = options.findIndex(o => o.value === this.select);
          idx = unsignedMod(idx + 1, options.length);
          // Update selection
          this.select = options[idx].value;
          optionsList?.bringItemIntoFocus(this.select);
          break;
        case "Tab":
        case "Enter":
          event.preventDefault();
          if(options.length) {
            // Apply filter
            this.applyFilter(this.select);
          }
          // Force search field out of focus
          (this.$refs.search as any)!.blur();
          break;
      }
    },

    /**
     * Applies a filter.
     * @param id
     *  The filter's id.
     */
    applyFilter(id: string | null) {
      if(!this.isFilterChecked(id)) {
        this.$emit("execute", EditorCommands.applyFilter(this.control, id));
      }
    },

    /**
     * Completely rebuilds the listed filters.
     */
    rebuildListedFilters() {
      this.listedFilters.clear();
      // Build initial filters
      for(let [id, value] of this.control.options) {
        this.listedFilters.set(id, value);
      }
      // If no maximum...
      if(this.maxFilters === -1) {
        // ...finish
        return;
      }
      // Configure edit mode
      if(this.maxFilters < this.listedFilters.size) {
        this.enterEditMode = true;
      } else {
        this.enterEditMode = false;
      }
      // Attempt to cut the list down to maxItems
      let ids = [...this.listedFilters.keys()];
      let i = ids.length - 1;
      for(; 0 <= i && this.listedFilters.size > this.maxFilters; i--){
        if(!this.isFilterChecked(ids[i])) {
          this.listedFilters.delete(ids[i]);
        }
      }
    },

    /**
     * Refreshes the listed filters with newly applied filters.
     */
    refreshListedFilters() {
      for(let [id, value] of this.control.options) {
        if(this.isFilterChecked(id)) {
          this.listedFilters.set(id, value);
        }
      }
    }
    
  },
  watch: {
    // On options change
    "control.options"(){
      if(this.control.options.size <= this.maxFilters) {
        this.rebuildListedFilters();
      } else if(!this.enterEditMode) {
        this.rebuildListedFilters();
      } else {
        for(let key of this.listedFilters.keys()) {
          let text = this.control.options.get(key);
          if(text !== undefined) {
            this.listedFilters.set(key, text);
          } else {
            this.listedFilters.delete(key);
          }
        }
      }
    },
    // On applied filters change
    "control.appliedFilters": {
      handler() {
        this.refreshListedFilters();
      },
      deep: true
    }
  },
  mounted() {
    this.rebuildListedFilters();
  },
  components: { CheckboxBar, OptionsList }
});
</script>

<style scoped>

/** === Main Control === */

.filter-controller {
  width: 100%;
}

.checkbox-container {
  display: flex;
  width: 100%;
  height: 29px;
  margin-bottom: 8px;
}

.checkbox-container:last-child {
  margin-bottom: 0px;
}

.checkbox-bar {
  flex: 1;
  cursor: pointer;
}

.drop-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #737373;
  user-select: none;
  width: 29px;
  height: 100%;
  border: solid 1px #333333;
  border-radius: 3px;
  box-sizing: border-box;
  margin-left: 6px;
  background: #242424;
  cursor: pointer;
}

.drop-filter:hover {
  color: #b3b3b3;
}

/** === New Filter === */


.checkbox-container.new-filter {
  opacity: .6;
}

.checkbox-container.new-filter.active {
  opacity: 1;
}

.search-container {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
}

.filter-search {
  grid-area: 1 / 1;
  position: relative;
  color: #a8a8a8;
  font-family: inherit;
  font-size: 9.5pt;
  font-weight: 500;
  padding: 0px 10px;
  border: solid 1px #333333;
  border-radius: 3px;
  box-sizing: border-box;
  background: #242424;
}

.filter-search::placeholder {
  color: #bfbfbf;
}

.active .filter-search::placeholder {
  color: #8f8f8f;
}

.filter-search:focus {
  outline: none;
}

.options-list:not(.flip) + .filter-search {
  border: solid 1px #3b3b3b;
  border-bottom-style: dotted;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.options-list.flip + .filter-search {
  border: solid 1px #3b3b3b;
  border-top-style: dotted;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.options-list {
  position: relative;
  grid-area: 1 / 1;
  background: #252525;
}

.new-filter .drop-filter {
  cursor: inherit;
}

.new-filter .drop-filter:hover {
  color: #737373;
}

</style>
