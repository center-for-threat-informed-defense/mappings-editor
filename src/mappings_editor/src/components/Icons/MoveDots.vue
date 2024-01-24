<template>
  <svg :fill="color" width="10" height="7" version="1.1" viewBox="0 0 2.6458 1.8521" xmlns="http://www.w3.org/2000/svg">
    <path d="m0 0v0.52917h0.52917v-0.52917zm1.0583 0v0.52917h0.52917v-0.52917zm1.0583 0v0.52917h0.52917v-0.52917zm-2.1167 1.3229v0.52917h0.52917v-0.52917zm1.0583 0v0.52917h0.52917v-0.52917zm1.0583 0v0.52917h0.52917v-0.52917z"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({ 
  name: "MoveDots",
  props: {
    color: {
      type: String,
      default: "#737373"
    }
  }
});
</script>
