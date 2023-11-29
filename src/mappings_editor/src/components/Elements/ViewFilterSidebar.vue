<template>
  <AccordionBox class="view-filter-sidebar-element">
    <AccordionPane :units="1" name="Organize Mappings">
    </AccordionPane>
    <AccordionPane :units="2" name="Filter Mappings">
    </AccordionPane>
  </AccordionBox>
</template>
  
<script lang="ts">
// Dependencies
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";
// Components
import AccordionBox from "../Containers/AccordionBox.vue";
import AccordionPane from "../Containers/AccordionPane.vue";

export default defineComponent({
  name: "ViewFilterSidebar",
  data() {
    return {
      application: useApplicationStore()
    };
  },
  computed: {


  },
  methods: {

  },
  components: { AccordionPane, AccordionBox }
});
</script>
  
<style scoped>



</style>
  