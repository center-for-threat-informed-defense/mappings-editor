<template>
  <div class="dynamic-object-framework-field">
    <FrameworkOptionsList 
      ref="optionsList"
      class="options-list"
      :select="select"
      :options="options"
      :maxHeight="maxHeight"
      :maxIdLength="property.framework.objectIdLength"
      @hover="objId => select = objId"
      @select="onObjectIdSelect"
      v-if="showOptions"
    />
    <div :class="['value', {
      'is-null': isNull,
      'is-targeted': property.isTargeted,
      'options-open': showOptions }]"
    >
      <input 
        ref="objectIdField"
        type="text"
        name="object-id"
        class="object-id"
        :style="objectIdStyle"
        @input="onObjectIdInput"
        @focusin="onObjectIdFocusIn"
        @focusout="onObjectIdFocusOut"
        @keyup.stop
        @keydown.stop="onObjectIdKeyDown"
        v-model="objectId"
        :placeholder="objectIdPlaceholder"
        autocomplete="off"
      />
      <span></span>
      <input 
        type="text"
        name="object-text"
        class="object-text"
        @input="onObjectTextInput"
        @keyup.stop
        @keydown.stop
        @focusin="onObjectTextFocusIn"
        @focusout="onObjectTextFocusOut"
        v-model="objectText"
        :disabled="isObjectTextFieldDisabled"
        :placeholder="objectTextPlaceholder"
        autocomplete="off"
      />
    </div>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
// Dependencies
import { unsignedMod } from "@/assets/scripts/Utilities";
import { defineComponent, type PropType, ref } from "vue";
import type { DynamicFrameworkObjectProperty } from "@/assets/scripts/MappingFile";
// Components
import FrameworkOptionsList from "./FrameworkOptionsList.vue";

export default defineComponent({
  name: "DynamicFrameworkObjectField",
  setup() {
    return { objectIdField: ref<HTMLElement | null>(null) };
  },
  props: {
    property: {
      type: Object as PropType<DynamicFrameworkObjectProperty>,
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
      hasFocus: false,
      select: null as string | null,
      objectId: this.property.objectId ?? "",
      objectText: this.property.objectText ?? "",
      showOptions: false
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
      let searchMatchesId, searchMatchesText;
      let st = this.objectId.toLocaleLowerCase();
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
     * Tests if the object text field is disabled.
     * @returns
     *  True if the object text field is disabled, false otherwise.
     */
    isObjectTextFieldDisabled(): boolean {
      return this.property.objectId === null || this.property.isObjectValueCached();
    },

    /**
     * Returns the object id's dynamic placeholder.
     * @returns
     *  The object id's dynamic placeholder.
     */
    objectIdPlaceholder(): string {
      return !this.hasFocus && this.property.objectId === null ? 
        this.idPlaceholder : "";
    },
 
    /**
     * Returns the object text's dynamic placeholder.
     * @returns
     *  The object text's dynamic placeholder.
     */
    objectTextPlaceholder(): string {
      return !this.hasFocus && this.property.objectId === null ?
        this.textPlaceholder : "";
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
     * Object id field focus in behavior.
     */
    onObjectIdFocusIn() {
      this.hasFocus = true;
      // Prompt suggestions
      if(this.objectId === "" || this.property.isObjectValueCached()) {
        this.promptSuggestions();
      }
    },

    /**
     * Object id field focus out behavior.
     */
    onObjectIdFocusOut() {
      this.hasFocus = false;
      // Only update when the value changes. When switching from an invalid
      // option to a valid option where both options share the same id, the
      // switch must be explicitly made by the user via onObjectIdKeyDown()
      // or onObjectIdSelect().
      let objectId = this.objectId || null;
      if(this.property.objectId !== objectId) {
        this.updatePropertyObjectId(objectId);
      }
      // Stop suggestions
      this.stopSuggestions();
    },

    /**
     * Object id field input behavior.
     */
    onObjectIdInput() {
      this.promptSuggestions();
    },

    /**
     * Object id field keydown behavior.
     * @param event
     *  The keydown event.
     */
    onObjectIdKeyDown(event: KeyboardEvent) {
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
          if(this.select === null) {
            idx = options.length;
          } else {
            idx = options.findIndex(o => o.objId === this.select);
          }
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
          if(this.select === null) {
            idx = -1;
          } else {
            idx = options.findIndex(o => o.objId === this.select);
          }
          idx = unsignedMod(idx + 1, options.length);
          // Update selection
          this.select = options[idx].objId;
          optionsList?.bringItemIntoFocus(this.select);
          break;
        case "Tab":
        case "Enter":
          event.preventDefault();
          // Update value
          this.updatePropertyObjectId(this.select ?? this.objectId);
          // Force object id field out of focus
          this.objectIdField!.blur();
          break;
      }
    },

    /**
     * Object text id select behavior.
     * @param objectId
     *  The object id.
     */
    onObjectIdSelect(objectId: string) {
      this.updatePropertyObjectId(objectId);
    },

    /**
     * Object text field focus in behavior.
     */
    onObjectTextFocusIn() {
      let cmd = EditorCommands.enterDynamicFrameworkObjectProperty(this.property);
      this.$emit("execute", cmd);
    },

    /**
     * Object text field focus out behavior.
     */
    onObjectTextFocusOut() {
      let cmd = EditorCommands.exitDynamicFrameworkObjectProperty(this.property);
      this.$emit("execute", cmd);
    },

    /**
     * Object text field input behavior.
     */
    onObjectTextInput() {
      this.updatePropertyObjectText();
    },

    /**
     * Prompt zero or more suggestions.
     */
    async promptSuggestions() {
      this.stopSuggestions();
      let focusId;
      let exactIdMatch = this.options.find(o => this.objectId === o.objId);
      if(exactIdMatch) {
        focusId = exactIdMatch.objId;
        this.select = exactIdMatch.objId;
      } else {
        focusId = this.options[0]?.objId;
      }
      if(focusId) {
        this.showOptions = true;
        await this.$nextTick();
        (this.$refs.optionsList as any).focusItemTop(focusId);
      }
    },

    /**
     * Stops the suggestion prompt.
     */
    stopSuggestions() {
      this.showOptions = false;
      this.select = null;
    },

    /**
     * Updates the field's property object id.
     * @param objectId
     *  The property's new object id.
     */
    updatePropertyObjectId(objectId: string | null) {
      if(objectId === "") objectId = null;
      // Execute update command
      let idChange = this.property.objectId !== objectId;
      let wasCached = this.property.isObjectValueCached();
      if(idChange || wasCached) {
        let cmd = EditorCommands.setFrameworkObjectPropertyId(this.property, objectId);
        this.$emit("execute", cmd);
      }
      this.refreshValue();
    },

    /**
     * Updates the field's property object text.
     */
    updatePropertyObjectText() {
      // Execute update command
      if(this.property.objectText !== this.objectText) {
        let cmd = EditorCommands.setFrameworkObjectPropertyText(this.property, this.objectText);
        this.$emit("execute", cmd);
      }
    },

    /**
     * Updates the field's value.
     */
    refreshValue() {
      this.objectId = this.property.objectId ?? "";
      this.objectText = this.property.objectText ?? "";
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
    },
    "property.objectText"() {
      // Refresh value
      this.refreshValue();
    }
  },
  components: { FrameworkOptionsList }
});
</script>

<style scoped>

/** === Main Field === */

.dynamic-object-framework-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  height: 30px;
}

/** === Value Text === */

.value {
  grid-area: 1 / 1;
  position: relative;
  display: flex;
  color: #c7c7c7;
  font-size: 9.5pt;
  user-select: none;
  width: 100%;
  height: 100%;
}

.value span {
  border-right: solid 1px #292929;
}

.value .object-id {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d9d9d9;
  font-family: "DM Mono";
  font-size: 8.5pt;
  font-weight: 500;
  text-align: center;
  height: 100%;
  min-width: 80px;
  max-width: 50%;
  padding: 0px 15px;
  border: none;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  box-sizing: border-box;
  background: #637bc9;
}

.value .object-text {
  flex: 1;
  display: flex;
  align-items: center;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  height: 100%;
  padding: 0px 15px;
  border: none;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  box-sizing: border-box;
  background: #404040;
  overflow: hidden;
}

.value .object-id p,
.value .object-text p {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.value .object-id::placeholder,
.value .object-text::placeholder {
  color: #a6a6a6;
}

.options-list:not(.flip) + .value.options-open .object-id {
  border-bottom-left-radius: 0px;
}

.options-list.flip + .value.options-open .object-id {
  border-top-left-radius: 0px;
}

.options-list:not(.flip) + .value.options-open .object-text {
  border-bottom-right-radius: 0px;
}

.options-list.flip + .value.options-open .object-text {
  border-top-right-radius: 0px;
}

/** === Null Value Text === */

.value.is-null .object-id {
  color: #c7c7c7;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  background: #404040;
}

.value.is-null .object-text {
  user-select: none;
  pointer-events: none;
}

.value .object-text:disabled {
  color: #a8a8a8;
  padding: 0px 10px 0px 14px;
  border: solid 1px #404040;
  background: #303030;
}

/** === Focused Value Text === */

.value .object-id:focus, 
.value .object-text:focus {
  outline: none;
}

.value .object-id:focus {
  color: #c7c7c7;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  border: solid 1px #575757;
  background: #404040;
}

.value:not(.is-targeted) .object-text:focus {
  border: solid 1px #575757;
  padding: 0px 14px;
}

/** === Targeted Value Text === */

.is-targeted .object-text {
  background: #292929;
  background-image: 
    linear-gradient(to right, #575757 50%, #292929 50%),
    linear-gradient(to right, #575757 50%, #292929 50%),
    linear-gradient(to bottom, #575757 50%, #292929 50%),
    linear-gradient(to bottom, #575757 50%, #292929 50%);
  background-size: 6px 1px, 6px 1px, 1px 6px, 1px 6px;
  background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
  background-position: 0 0, 0 100%, 0 0, 100% 0;
  animation: marching-ants 1s linear infinite;
}

@keyframes marching-ants {
  0% {
    background-position: 0 0, 0 100%, 0 0, 100% 0;
  }
  100% {
    background-position: 12px 0, -12px 100%, 0 -12px, 100% 12px;
  }
}

/** === Dropdown Options === */

.options-list {
  grid-area: 1 / 1;
  position: relative;
}

</style>
