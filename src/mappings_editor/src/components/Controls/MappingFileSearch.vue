<template>
  <div class="mapping-file-search-control">
    <input
      name="search"
      type="text"
      placeholder="Search Mappings..."
      autocomplete="off"
      v-model="searchTerm"
      @keydown.enter="handleEnterPress"
      class="search-input"
    >
    <span v-if="searchResults.length || emptyResults" class="search-result-navigation">
      <span class="search-result-text">{{`${emptyResults ? currentItemIndex : currentItemIndex + 1}/${searchResults.length}`}}</span>
      <ArrowUp class="clickable-icon" @click="goToPreviousItem"/>
      <ArrowDown class="clickable-icon" @click="goToNextItem"/>
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
      searchResults: [] as string[],
      currentItem: "",
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
    currentItemIndex(){
      return this.searchResults.length ? this.searchResults.indexOf(this.currentItem) : 0;
    }
  },
  emits: ["execute"],
  methods: {
    goToPreviousItem(){
      // go to the previous search result
      // when at the first search result, the previous search result is the last search result
      this.currentItemIndex > 0 ? this.currentItem = this.searchResults[this.currentItemIndex - 1] : this.currentItem = this.searchResults[this.searchResults.length - 1];

    },
    goToNextItem() {
      // go the the next search result
      // when at the last search result, the next search result is the first search result
      this.currentItemIndex < this.searchResults.length - 1 ? this.currentItem = this.searchResults[this.currentItemIndex + 1] : this.currentItem = this.searchResults[0];
    },
    handleCurrentItemChange(currentItem: string, previousItem: string){
      // de-select previously selected search result
      previousItem && this.editor.view.setItemSelect(previousItem, false);
      // select current search result
      this.editor.view.setItemSelect(currentItem, true);
      // move current search result to the top of the view
      this.editor.view.moveToViewItem(currentItem, 0, true, true);
    },
    handleEnterPress(){
      this.emptyResults = false;
      this.searchResults = this.editor.getIdsMatchingSearch(this.searchTerm);
      // track if a search was attempted but no results were found
      !this.searchResults.length && (this.emptyResults = true);
      this.editor.view.setAllItemsSelect(false);
      this.searchTerm !== this.previousSearchTerm ? this.currentItem = this.searchResults[0] : this.goToNextItem();
      // store previous search term to track if current item should be re-set
      this.previousSearchTerm = this.searchTerm;
    },
  },
  watch: {
    currentItem(newValue: string, previousValue: string){
      if(this.searchResults.length){
        this.handleCurrentItemChange(newValue, previousValue)
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


</style>
