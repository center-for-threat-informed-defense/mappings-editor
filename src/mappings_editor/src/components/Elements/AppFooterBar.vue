<template>
  <div class="app-footer-bar-element">
  </div>
</template>
    
<script lang="ts">
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";

export default defineComponent({
  name: "AppFooterBar",
  data() {
    return {
      application: useApplicationStore()
    };
  },
  computed: {


  },
  methods: {

  }
});
</script>
    
<style scoped>
</style>
    