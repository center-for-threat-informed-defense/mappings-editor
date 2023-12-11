<template>
  <FocusBox
    class="strict-object-framework-field"
    pointerEvent="pointerdown"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <FrameworkOptionsList 
      ref="optionsList"
      class="options-list"
      :select="select"
      :options="options"
      :maxHeight="maxHeight"
      :maxIdLength="property.framework.objectIdLength"
      @hover="objId => select = objId"
      @select="updatePropertyObjectId"
      v-if="showMenu"
    />
    <div :class="['value-container', { 'search-open': showSearch }]">
      <div :class="['value', { 'is-null': isNull }]">
        <div class="object-id" :style="objectIdStyle">
          <p>{{ property.objectId ?? idPlaceholder }}</p>
        </div>
        <div class="object-text">
          {{ property.objectText ?? textPlaceholder }}
        </div>
      </div>
      <input 
        type="text" 
        ref="search"
        name="search"
        class="value-search"
        placeholder="Search"
        @input="onSearchInput"
        @keyup.stop
        @keydown.stop="onSearchKeyDown"
        v-model="searchTerm"
        v-if="showSearch"
      />
      <div class="dropdown-arrow">▼</div>
    </div>
  </FocusBox>
</template>

<script lang="ts">
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
// Dependencies
import { unsignedMod } from "@/assets/scripts/Utilities";
import { defineComponent, type PropType } from "vue";
import type { StrictFrameworkObjectProperty } from "@/assets/scripts/MappingFile";
// Components
import FocusBox from "@/components/Containers/FocusBox.vue";
import FrameworkOptionsList from "./FrameworkOptionsList.vue";

export default defineComponent({
  name: "StrictFrameworkObjectField",
  props: {
    property: {
      type: Object as PropType<StrictFrameworkObjectProperty>,
      required: true
    },
    idPlaceholder: {
      type: String,
      default: "-"
    },
    textPlaceholder: {
      type: String,
      default: "-"
    },
    maxHeight: {
      type: Number,
      default: 211
    }
  },
  data() {
    return {
      select: this.property.objectId,
      showMenu: false,
      showSearch: false,
      searchTerm: ""
    }
  },
  computed: {

    /**
     * Tests if the null option is selected.
     * @returns
     *  True if the null option is selected, false otherwise.
     */
    isNull(): boolean {
      return this.property.objectId === null;
    },
    
    /**
     * Returns the enum's options.
     * @returns
     *  The enum's options.
     */
    options(): { objId: string | null, objIdText: string, objText: string }[] {
      let options: { objId: string | null, objIdText: string, objText: string }[] = [];
      if(this.searchTerm === "") {
        options.push({ objId: null, objIdText: "-", objText : "-" });
      }
      let searchMatchesId, searchMatchesText;
      let st = this.searchTerm.toLocaleLowerCase();
      for(let [objId, objText] of this.property.framework.options) {
        if(objId === null) {
          continue;
        }
        objText ??= ""
        searchMatchesId = objId.toLocaleLowerCase().includes(st);
        searchMatchesText = objText.toLocaleLowerCase().includes(st);
        if(st === "" || searchMatchesId || searchMatchesText) {
          options.push({ objId, objIdText: objId , objText });
        }
      }
      return options;
    },

    /**
     * Returns the object id style.
     * @returns
     *  The object id style.
     */
    objectIdStyle(): { width: string } {
      // +30 for containers padding
      return { width: `${ (this.property.framework.objectIdLength * 7) + 30 }px` };
    },

    /**
     * Returns the option's scrollbox style.
     * @returns
     *  The option's scrollbox style.
     */
    optionsStyle(): { maxHeight: string } {
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
      this.select = this.property.objectId;
    },

    /**
     * Search field input behavior.
     */
    onSearchInput() {
      // Update select
      this.select = null;
      if(this.searchTerm === "") {
        this.select = this.property.objectId;
      } else if(this.options.length) {
        this.select = this.options[0].objId;
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
          idx = options.findIndex(o => o.objId === this.select);
          idx = unsignedMod(idx - 1, options.length);
          // Update selection
          this.select = options[idx].objId;
          optionsList?.bringItemIntoFocus(this.select);
          break;
        case "ArrowDown":
          if(!options.length) { 
            return;
          }
          event.preventDefault();
          // Resolve index
          idx = options.findIndex(o => o.objId === this.select);
          idx = unsignedMod(idx + 1, options.length);
          // Update selection
          this.select = options[idx].objId;
          optionsList?.bringItemIntoFocus(this.select);
          break;
        case "Tab":
        case "Enter":
          event.preventDefault();
          // Update value
          this.updatePropertyObjectId(this.select);
          // Force search field out of focus
          (this.$refs.search as any)!.blur();
          break;
      }
    },

    /**
     * Updates the field's property object id.
     * @param objectId
     *  The property's new object id.
     */
    updatePropertyObjectId(objectId: string | null) {
      // Execute update command
      let idChange = this.property.objectId !== objectId;
      let wasCached = this.property.isObjectValueCached();
      if(idChange || wasCached) {
        let cmd = EditorCommands.setFrameworkObjectPropertyId(this.property, objectId);
        this.$emit("execute", cmd);
      }
    },

    /**
     * Updates the field's value.
     */
    refreshValue() {
      this.select = this.property.objectId;
    }
    
  },
  watch: {
    "property"() {
      // Refresh value
      this.refreshValue();
    },
    "property.objectId"() {
      // Refresh value
      this.refreshValue();
    }
  },
  components: { FocusBox, FrameworkOptionsList }
});
</script>

<style scoped>

/** === Main Field === */

.strict-object-framework-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  border-radius: 3px;
  cursor: pointer;
}

/** === Value Text === */

.value-container {
  grid-area: 1 / 1;
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  border-radius: 3px;
  box-sizing: border-box;
  background: #404040;
}

.options-list:not(.flip) + .value-container.search-open {
  border: solid 1px #575757;
  border-bottom: none;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.options-list.flip + .value-container.search-open {
  border: solid 1px #575757;
  border-top: none;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
}

.value-container.search-open .value {
  display: none;
}

.value {
  flex: 1;
  display: flex;
  align-items: center;
  color: #c7c7c7;
  font-size: 9.5pt;
  user-select: none;
  height: 100%;
  overflow: hidden;
}

.value .object-id {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d9d9d9;
  font-family: "DM Mono";
  font-size: 8.5pt;
  font-weight: 500;
  height: 100%;
  max-width: 50%;
  padding: 0px 15px;
  border-right: solid 1px #292929;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  box-sizing: border-box;
  background: #637bc9;
}

.value .object-id p {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}


.value .object-text {
  flex: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0px 10px 0px 15px;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  box-sizing: border-box;
  overflow: hidden;
}

.value.is-null .object-id,
.value.is-null .object-text {
  color: #a6a6a6;
}

.value.is-null .object-id {
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  background: #404040;
}

.dropdown-arrow {
  color: #7a7a7a;
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
  padding: 0px 10px 0px 15px;
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
  position: relative;
  grid-area: 1 / 1;
}

</style>
