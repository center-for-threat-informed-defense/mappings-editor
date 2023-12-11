<template>
  <svg :fill="color" width="10" height="10" version="1.1" viewBox="0 0 2.6458 2.6458" xmlns="http://www.w3.org/2000/svg">
    <path d="m1.0583 0v1.0583h-1.0583v0.52917h1.0583v1.0583h0.52917v-1.0583h1.0583v-0.52917h-1.0583v-1.0583z"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PlusLarge",
  props: {
    color: {
      type: String,
      default: "#737373"
    }
  }
});
</script>
