<template>
  <div class="mapping-file-search-control">
    <input
      name="search"
      type="text"
      class="search-input"
      placeholder="Search Mappings..."
      autocomplete="off"
      v-model="searchTerm"
      @keydown.stop=""
      @keyup.stop="onInput"
    >
    <template v-if="showNavigation">
      <div class="nav-element result-count">
        <span>{{ searchCount[0] }}/{{ searchCount[1] }}</span>
      </div>
      <div class="nav-element icon" @click="traverseSearchResults(-1)">
        <span>↑</span>
      </div>
      <div class="nav-element icon" @click="traverseSearchResults(1)">
        <span>↓</span>
      </div>
      <div class="nav-element icon clear" @click="clearSearch">
        <span>✗</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { unsignedMod } from "@/assets/scripts/Utilities";
import { defineComponent } from 'vue';
import { useApplicationStore } from "@/stores/ApplicationStore";
import type { EditorCommand, MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import type { MappingFileView, MappingFileViewItem, MappingObjectView } from "@/assets/scripts/MappingFileView";


export default defineComponent({
  name: 'MappingFileSearch',
  data() {
    return {
      showNavigation: false,
      searchTerm: "",
      searchItem: null as MappingObjectView | null,
      searchCount: [0,0],
      application: useApplicationStore()
    }
  },
  emits: ["execute"],
  methods: {

    /**
     * Executes an {@link EditorCommand}.
     * @param cmd
     *  The command to execute.
     */
    execute(cmd: EditorCommand) {
      this.$emit("execute", cmd);
    },

    /**
     * Search input behavior.
     */
    onInput(event: KeyboardEvent) {
      if(this.searchTerm === "") {
        this.clearSearch();
      } else {
        this.showNavigation = true;
      }
      switch(event.key) {
        case "Enter":
          this.traverseSearchResults(1);
          break;
        default:
          this.traverseSearchResults(0);
          break;
      }
    },

    /**
     * Clears the search bar.
     */
    clearSearch() {
      this.searchTerm = "";
      // Hide search navigation
      this.showNavigation = false;
      // Clear selection
      const view = this.application.activeFileView as MappingFileView;
      const cmd = EditorCommands.unselectAllMappingObjectViews(view);
      this.$emit("execute", cmd)
    },

    /**
     * Traverses the search results.
     * @param increments
     *  The number of results to jump forward/backward by.
     */
    traverseSearchResults(increment: number) {
      const view = this.application.activeFileView as MappingFileView;
      const editor = this.application.activeEditor as MappingFileEditor;
      // Search objects
      const unorderedResults = editor.searchMappingObjects(this.searchTerm);
      // Order and filter results according to view
      const results = [];
      for(let item of view.getItems()) {
        if(unorderedResults.has(item.id)) {
          results.push(item.id);
        }
      }
      // Update total items
      this.searchCount[1] = results.length;
      // If no matches, bail
      if(results.length === 0) {
        this.searchCount[0] = 0;
        return;
      }
      // Traverse search
      let nearestIdx;
      if(this.searchItem) {
        nearestIdx = this.getNearestItem(this.searchItem.id, results);
      } else {
        nearestIdx = 0;
      }
      const nextIdx = unsignedMod(nearestIdx + increment, results.length);
      const searchItem = view.getItem(results[nextIdx]) as MappingObjectView;
      this.searchCount[0] = nextIdx + 1;
      // Update view
      let cmd = EditorCommands.createGroupCommand();
      cmd.do(EditorCommands.unselectAllMappingObjectViews(view));
      cmd.do(EditorCommands.selectMappingObjectView(searchItem));
      cmd.do(EditorCommands.moveCameraToViewItem(searchItem, 0, true));
      this.execute(cmd);
      // Update search item
      this.searchItem = searchItem;
    },

    /**
     * Returns the view item (in a set of view items) nearest to a specified
     * view item.
     * @remarks
     *  This implementation currently assumes that all view items that follow
     *  `id` are "nearer" than the items that precede it.
     * @param id
     *  The view item's id.
     * @param items
     *  The set of view items.
     * @returns
     *  The index of the view item (in the set of view items) nearest to `id`.
     */
    getNearestItem(id: string, items: string[]): number {
      const view = this.application.activeFileView as MappingFileView;
      const set = new Set(items);
      let item: MappingFileViewItem | null;
      // Traverse forward
      item = view.getItem(id);
      for(; item !== null; item = item.next) {
        if(set.has(item.id)) {
          return items.indexOf(item.id);
        }
      }
      // Traverse backward
      item = view.getItem(id);
      for(; item !== null; item = item.prev) {
        if(set.has(item.id)) {
          return items.indexOf(item.id);
        }
      }
      return -1;
    }

  }
});
</script>

<style scoped>

/** === Main Control === */

.mapping-file-search-control {
  display: flex;
  width: 100%;
  border: none;
  border-radius: 5px;
  box-sizing: border-box;
  background: #3d3d3d;
}

.mapping-file-search-control input {
  flex: 1;
  color: #bfbfbf;
  font-size: 12pt;
  font-family: "Inter";
  padding: 12px 0px 12px 20px;
  border: none;
  background: none;
  outline: none;
}

/** === Search Navigation === */

.nav-element {
  display: flex;
  align-items: center;
  padding-left: 15px;
}

.nav-element:last-child {
  padding-right: 15px;
}

.result-count {
  color: #cccccc;
  font-size: 10.5pt;
  font-weight: 500;
  user-select: none;
}

.result-count span {
  padding: 5px 15px 5px 0px;
  border-right: solid 1px #737373;
}

.icon {
  color: #a6a6a6;
  font-size: 13pt;
  font-weight: 600;
  user-select: none;
  cursor: pointer;
}

.icon:hover {
  color: #cccccc;
}

.icon.clear {
  font-size: 16pt;
  font-weight: 500;
}

</style>
