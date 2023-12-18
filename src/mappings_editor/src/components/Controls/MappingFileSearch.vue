<template>
  <div class="mapping-file-search-control">
    <input name="search" type="text" placeholder="Search Mappings..." autocomplete="off" />
  </div>
</template>
  
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";

export default defineComponent({
  name: 'MappingFileSearch',
  props: {
    editor: {
      type: Object as PropType<MappingFileEditor>,
      required: true
    }
  },
  computed: {

  },
  emits: ["execute"],
  methods: {

  },
  components: {}
});
</script>
  
<style scoped>

/** === Main Control === */

.mapping-file-search-control {
  padding: 25px 40px;
  box-sizing: border-box;
}

.mapping-file-search-control input {
  width: 100%;
  color: #bfbfbf;
  font-size: 12pt;
  font-family: "Inter";
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  box-sizing: border-box;
  background: #3d3d3d;
  outline: none;
}

</style>
