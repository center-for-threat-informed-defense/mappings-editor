<template>
  <input 
    type="text" 
    name="property"
    class="text-field"
    :placeholder="placeholder"
    @input="onInput"
    @keyup.stop
    @keydown.stop
    v-model="value"
    autocomplete="off"
  />
</template>

<script lang="ts">
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands"
// Dependencies
import { defineComponent, type PropType } from "vue";
import type { StringProperty } from "@/assets/scripts/MappingFile";

export default defineComponent({
  name: "TextField",
  props: {
    property: {
      type: Object as PropType<StringProperty>,
      required: true
    },
    placeholder: {
      type: String,
      default: "-"
    },
    updateDelay: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      value: "",
      timeoutId: -1
    }
  },
  emits: ["execute"],
  methods: {

    /**
     * Field input behavior.
     */
    onInput() {
      // Reissue update request
      clearTimeout(this.timeoutId);
      this.timeoutId = window.setTimeout(() => {
        this.updateValue();
      }, this.updateDelay)
    },

    /**
     * Updates the field's value.
     */
    updateValue() {
      let value = this.value || null;
      if(value !== this.property.value) {
        let cmd = EditorCommands.setStringProperty(this.property, value);
        this.$emit("execute", cmd);
      }
    },

    /**
     * Updates the field's value.
     */
    refreshValue() {
      this.value = this.property.value ?? "";
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
    this.refreshValue();
  },
  unmounted() {
    clearTimeout(this.timeoutId);
    this.updateValue();
  }
});
</script>

<style scoped>

/** === Main Field === */

.text-field {
  color: #bfbfbf;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  width: 50px;
  height: 30px;
  padding: 0px 15px;
  border: none;
  border-radius: 3px;
  box-sizing: border-box;
  background: #303030;
}

.text-field:focus {
  padding: 6px 14px;
  border: solid 1px #454545;
}

.text-field::placeholder {
  color: #999;
}

.text-field:focus {
  outline: none;
}

</style>
