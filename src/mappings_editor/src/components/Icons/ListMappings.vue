<template>
<svg :fill="color" xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 18 10">
  <path id="Path_9" data-name="Path 9" d="M5,13H19V11H5ZM3,17H17V15H3ZM7,7V9H21V7Z" transform="translate(-3 -7)"/>
</svg>


</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "ListMappings",
  props: {
    color: {
      type: String,
      default: "#737373"
    }
  }
});
</script>
