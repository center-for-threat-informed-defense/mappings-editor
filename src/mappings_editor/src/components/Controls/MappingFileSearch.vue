<template>
  <div class="mapping-file-search-control">
    <input
      name="search"
      type="text"
      placeholder="Search Mappings..."
      autocomplete="off"
      v-model="searchTerm"
      @keydown.enter="handleEnterPress"
      @input="handleSearchTermChange"
      class="search-input"
    >
    <span v-if="searchResults.length || emptyResults" class="search-result-navigation">
      <span class="search-result-text">{{`${emptyResults ? currentItemIndex : currentItemIndex + 1}/${searchResults.length}`}}</span>
      <ArrowUp :class="currentItemIndex <= 0 ? 'disabled' : 'clickable-icon'" @click="goToPreviousItem"/>
      <ArrowDown :class="currentItemIndex >= searchResults.length - 1 ? 'disabled' : 'clickable-icon'" @click="goToNextItem"/>
    </span>
  </div>
</template>
  
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import ArrowDown from '../Icons/ArrowDown.vue';
import ArrowUp from '../Icons/ArrowUp.vue';

export default defineComponent({
  name: 'MappingFileSearch',
  data() {
    return {
      previousSearchTerm: "",
      searchTerm: "",
      searchResults: [],
      currentItemIndex: 0,
      emptyResults: false
    }
  },
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
    goToPreviousItem(){
      this.currentItemIndex > 0 && this.currentItemIndex --;
    },
    goToNextItem() {
      this.currentItemIndex < this.searchResults.length - 1 && this.currentItemIndex ++;
    },
    handleCurrentItemIndexChange(newValue, previousValue){
      this.editor.view.setItemSelect(this.searchResults[previousValue], false);
      this.editor.view.setItemSelect(this.searchResults[newValue], true);
      this.editor.view.moveToViewItem(this.searchResults[newValue], 0, true, true);
    },
    handleEnterPress(){
      if(this.searchTerm !== this.previousSearchTerm){
        this.emptyResults = false;
        this.editor.view.setAllItemsSelect(false);
        this.searchResults = this.editor.getIdsMatchingSearch(this.searchTerm);
        this.currentItemIndex = 0;
        !this.searchResults.length && (this.emptyResults = true);
      }
      else if(this.currentItemIndex < this.searchResults.length  - 1) {
        this.currentItemIndex ++;
      }
      //store search term so can tell if enter is for new search or new index item focus
      this.previousSearchTerm = this.searchTerm;
    },
    handleSearchTermChange(){
      if(this.searchTerm === ''){
        this.currentItemIndex = 0;
        this.searchResults = [];
        this.emptyResults = false;
        this.previousSearchTerm = "";
      }
    }
  },
  watch: {
    currentItemIndex(newValue, previousValue){
      if(this.searchResults.length){
        this.handleCurrentItemIndexChange(newValue, previousValue)
      }
    }
  },
  components: {
    ArrowDown,
    ArrowUp,
  }
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
  position: relative;
}
.search-result-navigation{
  position: absolute;
  right: 50px;
  top: 3.75%;
  font-size: 11px;
  background-color: #262626;
  padding: 5px;
  border-radius: 4px;
}

.search-result-text {
  color: white;
  padding-right: 10px;
  user-select: none;
}

.clickable-icon {
  cursor: pointer;
}

.disabled {
  opacity: 0.5;
}

</style>
