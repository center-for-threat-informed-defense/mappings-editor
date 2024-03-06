<template>
  <TitleBar class="app-title-bar-element" :menus="menus" @select="onItemSelect">
    <template v-slot:icon>
      <span class="logo">
        <img alt="Logo" title="Logo" :src="icon">
      </span>
    </template>
  </TitleBar>
</template>

<script lang="ts">
const Favicons = import.meta.glob(`@/assets/configuration/**/*favicon*.png`, { as: "url", eager: true });
// Dependencies
import { defineComponent } from "vue";
import { useContextMenuStore } from "@/stores/ContextMenuStore";
import { useApplicationStore } from "@/stores/ApplicationStore";
import type { ContextMenuSubmenu, CommandEmitter } from "@/assets/scripts/Application";
// Components
import TitleBar from "@/components/Controls/TitleBar.vue";

export default defineComponent({
  name: "AppTitleBar",
  data() {
    return {
      icon: Object.values(Favicons)[0] ?? "",
      contextMenus: useContextMenuStore(),
      application: useApplicationStore()
    };
  },
  computed: {
    
    /**
     * Returns the application's menus.
     * @returns
     *  The application's menus.
     */
    menus(): ContextMenuSubmenu[] {
      return [
        this.contextMenus.fileMenu, 
        this.contextMenus.editMenu,
        this.contextMenus.viewMenu,
        this.contextMenus.helpMenu
      ]
    }

  },
  emits: ["execute"],
  methods: {

    /**
     * Menu item selection behavior.
     * @param emitter
     *  Menu item's command emitter.
     */
    async onItemSelect(emitter: CommandEmitter) {
      this.$emit("execute", emitter());
    }

  },
  components: { TitleBar }
});
</script>

<style scoped>

/** === App Logo === */

.logo {
  display: flex;
  align-items: center;
  margin: 0px 6px 0px 12px;
}

.logo img {
  height: 14px;
}

</style>
