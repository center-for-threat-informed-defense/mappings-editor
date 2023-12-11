<template>
  <div :class="['checkbox-bar-controller', { checked }]">
    <div class="checkbox"><CheckboxSmall /></div>
    <span class="text">{{ text }}</span>
  </div>
</template>
  
<script lang="ts">
// Dependencies
import { defineComponent } from "vue";
// Components
import CheckboxSmall from "../../Icons/CheckmarkSmall.vue";

export default defineComponent({
  name: "CheckboxBar",
  props: {
    text: {
      type: String,
      required: true
    },
    checked: {
      type: Boolean,
      default: false 
    }
  },
  components: { CheckboxSmall }
});
</script>

<style scoped>

/** === Main Controller === */

.checkbox-bar-controller {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #a8a8a8;
  font-size: 9.5pt;
  font-weight: 500;
  user-select: none;
  padding: 0px 8px;
  border: solid 1px #333333;
  border-radius: 3px;
  box-sizing: border-box;
  background: #242424;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #637bc9;
  font-size: 9pt;
  font-weight: 700;
  width: 13px;
  height: 13px;
  border: solid 1px #666666;
  border-radius: 2px;
  box-sizing: border-box;
  margin-right: 8px;
}

.checkbox svg {
  display: none;
}

.text {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/** === Checked Controller === */

.checkbox-bar-controller.checked {
  color: #d9d9d9;
  border: solid 1px #637bc9;
  background: #637bc9;
}

.checked .checkbox {
  border: none;
  background: #d9d9d9;
}

.checked .checkbox svg {
  display: block;
}

</style>
