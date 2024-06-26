<template>
  <HotkeyBox class="app-hotkey-box-element" :hotkeys="hotkeySet" :global="true" @fire="onHotkeyFired">
    <slot></slot>
  </HotkeyBox>
</template>

<script lang="ts">
// Dependencies
import { defineComponent } from "vue";
import { useHotkeyStore } from "@/stores/HotkeyStore";
import { useApplicationStore } from "@/stores/ApplicationStore";
import type { Hotkey } from "@/assets/scripts/Utilities/HotkeyObserver";
import type { CommandEmitter } from "@/assets/scripts/Application";
// Components
import HotkeyBox from "@/components/Containers/HotkeyBox.vue";

export default defineComponent({
  name: "AppHotkeyBox",
  data: () => ({
    hotkeys: useHotkeyStore(),
    application: useApplicationStore()
  }),
  computed: {
    
    /**
     * Returns the application's hotkeys.
     * @returns
     *  The application's hotkeys.
     */
    hotkeySet(): Hotkey<CommandEmitter>[] {
      return [
        ...this.hotkeys.nativeHotkeys, 
        ...this.hotkeys.fileHotkeys,
        ...this.hotkeys.editHotKeys,
        ...this.hotkeys.viewHotkeys
      ]
    }

  },
  methods: {

    /**
     * Hotkey fired behavior.
     * @param emitter
     *  The hotkey's command emitter.
     */
    async onHotkeyFired(emitter?: CommandEmitter) {
      if(!emitter) {
        return;
      }
      this.$emit("execute", emitter());
    }

  },
  emits: ["execute"],
  components: { HotkeyBox }
});
</script>
