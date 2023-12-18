<template>
  <svg width="11.314" height="7.0711" :fill="color" :class="{ collapsed }" version="1.1" viewBox="0 0 2.9934 1.8709" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(-.49321 -1.3794)">
      <path d="m1.9899 3.2503 1.4967-1.4967-0.37418-0.37418-1.1225 1.1225-1.1225-1.1225-0.37418 0.37418 1.1225 1.1225z"/>
    </g>
  </svg>
</template>
  
  <script lang="ts">
  import { defineComponent } from "vue";
  
  export default defineComponent({
    name: "CollapseArrowLarge",
    props: {
      collapsed: {
        type: Boolean,
        default: false 
      },
      color: {
        type: String,
        default: "#8c8c8c"
      }
    }
  });
  </script>
  
  <style scoped>
  
  /** === Main Icon === */
  
  .collapsed { 
    transform: rotate(270deg);
  }
  
  </style>
  