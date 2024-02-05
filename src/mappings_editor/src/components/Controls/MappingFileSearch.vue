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
      // go to the previous search result
      // when at the first search result, the previous search result is the last search result
      this.currentItemIndex > 0 ? this.currentItemIndex -- : this.currentItemIndex = this.searchResults.length - 1;

    },
    goToNextItem() {
      // go the the next search result
      // when at the last search result, the next search result is the first search result
      this.currentItemIndex < this.searchResults.length - 1 ? this.currentItemIndex ++ : this.currentItemIndex = 0;
    },
    handleCurrentItemIndexChange(newValue: number, previousValue: number){
      // de-select previously selected search result
      this.editor.view.setItemSelect(this.searchResults[previousValue], false);
      // select current search result
      this.editor.view.setItemSelect(this.searchResults[newValue], true);
      // move current search result to the top of the view
      this.editor.view.moveToViewItem(this.searchResults[newValue], 0, true, true);
    },
    handleEnterPress(){
      // if the user typed in a new search term
      // re-search the index
      if(this.searchTerm !== this.previousSearchTerm){
        this.emptyResults = false;
        this.editor.view.setAllItemsSelect(false);
        this.searchResults = this.editor.getIdsMatchingSearch(this.searchTerm);
        this.currentItemIndex = 0;
        !this.searchResults.length && (this.emptyResults = true);
      }
      // if the user pressed enter a second, third, fourth time etc. after the term was searched
      // go to the next item in the search results
      else {
        this.goToNextItem();
      }
      // store search term to keep track of enter presses
      // whether the enter press is for a new search or to go to the next search result
      this.previousSearchTerm = this.searchTerm;
    },
    handleSearchTermChange(){
      // if user deletes the entire search term but does not press enter, 
      // clear everything and start as if this is a new search term
      if(this.searchTerm === ''){
        this.currentItemIndex = 0;
        this.searchResults = [];
        this.emptyResults = false;
        this.previousSearchTerm = "";
      }
    }
  },
  watch: {
    currentItemIndex(newValue: number, previousValue: number){
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


</style>
