<template>
  <div class="list-item-field">
    <OptionsList 
      ref="optionsList"
      class="options-list"
      :select="select"
      :options="options"
      :maxHeight="maxHeight"
      @hover="value => select = value"
      @select="updateProperty"
      v-if="showMenu"
    />
    <div :class="['value-container', { 'search-open': showSearch, 'is-cached': isCached }]">
      <div :class="['value-text', { 'is-null': isNull }]">
        {{ property.exportText ?? placeholder }}
      </div>
      <input 
        type="text" 
        ref="search"
        name="search"
        class="value-search"
        placeholder="Search"
        @input="onSearchInput"
        @keyup.stop=""
        @keydown.stop="onSearchKeyDown"
        v-model="searchTerm"
        v-if="showSearch"
        autocomplete="off"
      />
      <div class="invalid-icon">⚠</div>
      <div class="dropdown-arrow">▼</div>
    </div>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands"
// Dependencies
import { RawFocusBox, unsignedMod } from "@/assets/scripts/Utilities";
import { defineComponent, markRaw, type PropType } from "vue";
import type { ListItemProperty } from "@/assets/scripts/MappingFile";
// Components
import OptionsList from "./OptionsList.vue";

export default defineComponent({
  name: "ListItemField",
  props: {
    property: {
      type: Object as PropType<ListItemProperty>,
      required: true
    },
    placeholder: {
      type: String,
      default: "-"
    },
    maxHeight: {
      type: Number,
      default: 195
    }
  },
  data() {
    return {
      select: this.property.value,
      showMenu: false,
      showSearch: false,
      searchTerm: "",
      focusBox: markRaw(new RawFocusBox("pointerdown"))
    }
  },
  computed: {

    /**
     * Tests if the null option is selected.
     * @returns
     *  True if the null option is selected, false otherwise.
     */
    isNull(): boolean {
      return this.property.value === null;
    },

    /**
     * Tests if the option's value is cached.
     * @returns
     *  True if the option's value is cached, false otherwise.
     */
    isCached(): boolean {
      return this.property.isValueCached();
    },
    
    /**
     * Returns the list item's options.
     * @returns
     *  The list item's options.
     */
    options(): { value: string | null, text: string }[] {
      let options: { value: string | null, text: string }[] = [];
      if(this.searchTerm === "") {
        options.push({ value: null, text: "None" });
      }
      let st = this.searchTerm.toLocaleLowerCase();
      for(let [value, item] of this.property.options.value) {
        let text = item.getAsString(this.property.exportTextKey);
        if(st === "" || text.toLocaleLowerCase().includes(st)) {
          options.push({ value, text });
        }
      }
      return options;
    },

    /**
     * Returns the scrollbox's style.
     * @returns
     *  The scrollbox's style.
     */
    style(): { maxHeight: string } {
      return { maxHeight: `${ this.maxHeight }px` };
    }

  },
  emits: ["execute"],
  methods: {

    /**
     * Field focus in behavior.
     */
    onFocusIn() {
      // Open menu
      this.showMenu = true;
      // Show search
      this.showSearch = true;
      // Focus search
      setTimeout(() => {
        (this.$refs.search as any)?.focus();
      }, 0);
    },

    /**
     * Field focus out behavior.
     */
    onFocusOut() {
      // Close menu
      this.showMenu = false;
      // Hide search
      this.showSearch = false;
      this.searchTerm = "";
      // Reset select
      this.select = this.property.value;
    },

    /**
     * Search field input behavior.
     */
    onSearchInput() {
      // Update select
      this.select = null;
      if(this.searchTerm === "") {
        this.select = this.property.value;
      } else if(this.options.length) {
        this.select = this.options[0].value;
      }
      // Focus selection
      let optionsList = this.$refs.optionsList as any;
      optionsList?.focusItemTop(this.select);
    },

    /**
     * Search field keydown behavior.
     * @param event
     *  The keydown event.
     */
    onSearchKeyDown(event: KeyboardEvent) {
      let idx;
      let options = this.options;
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
          // Update value
          this.updateProperty(this.select);
          // Force search field out of focus
          (this.$refs.search as any)!.blur();
          break;
      }
    },

    /**
     * Updates the field's property value.
     * @param value
     *  The property's new value.
     */
    updateProperty(value: string | null) {
      if(this.property.value !== value) {
        // Execute update command
        let cmd = EditorCommands.setListItemProperty(this.property, value);
        this.$emit("execute", cmd);
      }
    },

    /**
     * Updates the field's value.
     */
    refreshValue() {
      this.select = this.property.value
    }
    
  },
  watch: {
    "property"() {
      // Refresh value
      this.refreshValue();
    },
    "property.value"() {
      // Refresh value
      this.refreshValue();
    }
  },
  mounted() {
    this.focusBox.mount(
      this.$el,
      this.onFocusIn,
      this.onFocusOut
    );
  },
  unmounted() {
    this.focusBox.destroy()
  },
  components: { OptionsList }
});
</script>

<style scoped>

/** === Main Field === */

.list-item-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  font-size: 10pt;
  user-select: none;
  height: 30px;
  cursor: pointer;
}

/** === Value Text === */

.value-container {
  grid-area: 1 / 1;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 3px;
  box-sizing: border-box;
}

.options-list:not(.flip) + .value-container.search-open {
  border-style: solid;
  border-width: 1px;
  border-bottom: none;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.options-list.flip + .value-container.search-open {
  border-style: solid;
  border-width: 1px;
  border-top: none;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.value-container.search-open .value-text {
  display: none;
}

.value-text {
  flex: 1;
  user-select: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0px 10px 0px 15px;
  overflow: hidden;
}

.dropdown-arrow {
  font-size: 5.5pt;
  font-family: "Inter", sans-serif;
  text-align: center;
  user-select: none;
  padding-right: 10px;
}

/** === Value Search === */

.value-search {
  flex: 1;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  height: 100%;
  min-width: 0px;
  padding: 0px 10px 0px 14px;
  border: none;
  border-radius: 3px;
  box-sizing: border-box;
  background: none;
}

.value-search::placeholder {
  color: #999;
  opacity: 1;
}

.value-search:focus {
  outline: none;
}

/** === Dropdown Options === */

.options-list {
  grid-area: 1 / 1;
  position: relative;
}

/** === Default Palette === */

.value-container {
  border-color: #454545;
  background: #303030;
}

.value-text.is-null {
  color: #999;
}

.invalid-icon {
  display: none;
  color: #adadad;
  font-size: 10.5pt;
  margin-right: 9px;
}

.value-container.is-cached .invalid-icon {
  display: block;
}

.dropdown-arrow {
  color: #808080;
}

/** === Bright Palette === */

.bright .value-container {
  border-color: #575757;
  background: #404040;
}

.bright .value-text.is-null {
  color: #a6a6a6;
}

.bright .dropdown-arrow {
  color: #7a7a7a;
}

</style>
