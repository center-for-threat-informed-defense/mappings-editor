<template>
  <svg :fill="color" width="9.0673" height="7" version="1.1" viewBox="0 0 2.399 1.8521" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(-.68952 -.92454)">
      <path d="m2.7576 0.92454-1.1986 1.1938-0.54034-0.53071-0.32914 0.32974 0.86948 0.85925 1.5296-1.5217z" stroke-width=".30808"/>
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CheckmarkSmall",
  props: {
    color: {
      type: String,
      default: "#637bc9"
    }
  }
});
</script>
