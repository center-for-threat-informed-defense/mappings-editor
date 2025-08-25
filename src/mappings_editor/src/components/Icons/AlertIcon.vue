<template>
<svg :fill="color" xmlns="http://www.w3.org/2000/svg" width="13.476" height="12.261" viewBox="0 0 13.476 12.261">
  <path id="Subtraction_1" data-name="Subtraction 1" d="M14.237,14H1.763a.5.5,0,0,1-.437-.742L7.563,2a.5.5,0,0,1,.875,0l6.237,11.262a.5.5,0,0,1-.437.742ZM8,11a1,1,0,1,0,1,1A1,1,0,0,0,8,11ZM6.862,5.063l.251,5.272H8.887l.251-5.272Z" transform="translate(-1.262 -1.738)"/>
</svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "AlertIcon",
  props: {
    color: {
      type: String,
      default: "#737373"
    }
  }
});
</script>
