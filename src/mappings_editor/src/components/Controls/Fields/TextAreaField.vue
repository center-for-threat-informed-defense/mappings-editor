<template>
  <TextArea 
    class="text-area-field"
    @input="onInput"
    :placeholder="placeholder"
    :propagate-scroll="false"
    v-model="value"
  />
</template>

<script lang="ts">
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands"
// Dependencies
import { defineComponent, type PropType } from "vue";
import type { StringProperty } from "@/assets/scripts/MappingFile";
// Components
import TextArea from "./TextArea.vue"

export default defineComponent({
  name: "TextAreaField",
  props: {
    property: {
      type: Object as PropType<StringProperty>,
      required: true
    },
    placeholder: {
      type: String,
      default: "-"
    }
  },
  data() {
    return {
      value: ""
    }
  },
  emits: ["execute", "input"],
  methods: {

    /**
     * Field input behavior.
     */
    onInput() {
      let value = this.value === "" ? null : this.value;
      if(value !== this.property.value) {
        let cmd = EditorCommands.setStringProperty(this.property, value);
        this.$emit("execute", cmd);
      }
    },

    /**
     * Updates the field's text value.
     */
    refreshValue() {
      // Update value
      this.value = this.property.value ?? "";
    },
    
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
    // Refresh value
    this.refreshValue();
  },
  components: { TextArea }
});
</script>

<style scoped>

/** === Main Field === */

.text-area-field {
  color: #bfbfbf;
  height: 30px;
  border-radius: 3px;
  overflow: hidden;
}

.text-area-field :deep(.scroll-bar) {
  border: solid 1px #3b3b3b !important;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  margin-left: 2px;
  background: none !important;
}

.text-area-field.with-scrollbar :deep(textarea) {
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
}

.text-area-field :deep(textarea) {
  padding: 9px 15px;
  background: #303030;
}

.text-area-field :deep(textarea)::placeholder {
  color: #999;
}

.text-area-field :deep(textarea):focus {
  padding: 8px 14px;
  border: solid 1px #454545;
}

</style>
