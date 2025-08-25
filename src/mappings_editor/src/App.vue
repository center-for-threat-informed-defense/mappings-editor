<template>
  <AppHotkeyBox id="main" @execute="onExecute">
    <AppTitleBar id="app-title-bar" @execute="onExecute"/>
    <div id="app-body" ref="body" :style="gridLayout">
      <div class="frame left">
        <div class="resize-handle" @pointerdown="startResize($event, Handle.Left)"></div>
        <div class="sidebar-container" id="view-sidebar">
          <ActiveViewSidebar/>
          <component :is="application.activeSidebar.pane" :view="application.activeSidebar.pane" @execute="onExecute"/>
        </div>
      </div>
      <div class="frame center">
        <div id="file-search">
          <MappingFileSearch
            :editor="activeEditor"
            @execute="onExecute"
          />
        </div>
        <MappingFileViewControl
          id="file-editor"
          :editor="activeEditor"
          :paintSelectKeySequence="paintSelectKeySequence"
          :multiSelectKeySequence="multiSelectKeySequence"
          @execute="onExecute"
        />
      </div>
      <div class="frame bottom">
        <AppFooterBar id="app-footer-bar"/>
      </div>
    </div>
  </AppHotkeyBox>
</template>

<script lang="ts">
import * as AppCommands from "./assets/scripts/Application/Commands";
// Dependencies
import { PointerTracker } from "./assets/scripts/Utilities";
import { useApplicationStore } from "./stores/ApplicationStore";
import { defineComponent, markRaw, ref } from "vue";
import { Browser, OperatingSystem, clamp } from "./assets/scripts/Utilities";
import type { Command } from "./assets/scripts/Application";
import type { MappingFileEditor } from "./assets/scripts/MappingFileEditor";
// Components
import AppTitleBar from "./components/Elements/AppTitleBar.vue";
import AppHotkeyBox from "./components/Elements/AppHotkeyBox.vue";
import AppFooterBar from "./components/Elements/AppFooterBar.vue";
import ViewSidebar from "./components/Elements/ViewSidebar.vue";
import MappingFileSearch from "./components/Controls/MappingFileSearch.vue";
import MappingFileViewControl from "./components/Controls/MappingFileViewControl.vue";
import ActiveViewSidebar from "./components/Elements/ActiveViewSidebar.vue";
import ViewFilterSidebar from "./components/Elements/ViewFilterSidebar.vue";
import ProblemPane from "./components/Elements/ProblemPane.vue";

enum Handle {
  Center = 0,
  Left   = 1,
  Right  = 2,
}

export default defineComponent({
  name: 'App',
  setup() {
    return { body: ref<HTMLElement | null>(null) };
  },
  data: () => ({
    Handle,
    bodyWidth: -1,
    bodyHeight: -1,
    minFrameSize: {
      [Handle.Center]: 500,
      [Handle.Left]: 310,
      [Handle.Right]: 0,
    },
    activeFrameSize: {
      [Handle.Center]: NaN,
      [Handle.Left]: 350,
      [Handle.Right]: 0
    },
    track: markRaw(new PointerTracker()),
    onResizeObserver: null as ResizeObserver | null,
    application: useApplicationStore()
  }),
  computed: {

    /**
     * Returns the current grid layout.
     * @returns
     *  The current grid layout.
     */
    gridLayout(): { gridTemplateColumns: string } {
      let l = this.activeFrameSize[Handle.Left];
      let r = this.activeFrameSize[Handle.Right];
      return {
        gridTemplateColumns: `${ l }px minmax(0, 1fr) ${ r }px`
      }
    },

    /**
     * Returns the active file editor.
     * @returns
     *  The active file editor.
     */
    activeEditor(): MappingFileEditor {
      // Have to cast because Pinia seems to struggle with type inference
      return this.application.activeEditor as MappingFileEditor;
    },

    /**
     * Returns the paint select key sequence.
     * @returns
     *  The paint select key sequence.
     */
    paintSelectKeySequence(): string {
      return this.application.settings.hotkeys.edit.paint_select;
    },

    /**
     * Returns the multiselect key sequence.
     * @returns
     *  The multiselect key sequence.
     */
    multiSelectKeySequence(): string {
      return this.application.settings.hotkeys.edit.multi_select;
    }

  },
  methods: {

    /**
     * Command execution behavior.
     * @param emitter
     *  The command.
     */
    async onExecute(cmd: Command) {
      try {
        if(cmd instanceof Promise) {
          await this.application.execute(await cmd);
        } else {
          await this.application.execute(cmd);
        }
      } catch(ex: any) {
        alert(`Error: ${ ex.message }`)
        console.error(ex);
      }
    },

    /**
     * Resize handle drag start behavior.
     * @param event
     *  The pointer event.
     * @param handle
     *  The id of the handle being dragged.
     */
    startResize(event: PointerEvent, handle: Handle) {
      let origin = this.activeFrameSize[handle];
      this.track.capture(event, (e: MouseEvent, track: PointerTracker) => {
        e.preventDefault();
        switch(handle) {
          case Handle.Left:
            this.setLeftFrameSize(origin + track.deltaX);
            break;
          case Handle.Right:
            this.setRightFrameSize(origin - track.deltaX);
            break;
        }
      });
    },

    /**
     * Sets the size of the left frame.
     * @param size
     *  The frame's new size.
     */
    setLeftFrameSize(size: number) {
      const minRight = this.activeFrameSize[Handle.Right];
      const minCenter = this.minFrameSize[Handle.Center];
      const min = this.minFrameSize[Handle.Left];
      const max = Math.max(min, this.bodyWidth - minRight - minCenter);
      this.activeFrameSize[Handle.Left] = clamp(size, min, max);
    },

    /**
     * Sets the size of the right frame.
     * @param size
     *  The frame's new size.
     */
    setRightFrameSize(size: number) {
      const minLeft = this.activeFrameSize[Handle.Left];
      const minCenter = this.minFrameSize[Handle.Center];
      const min = this.minFrameSize[Handle.Right];
      const max = Math.max(min, this.bodyWidth - minLeft - minCenter);
      this.activeFrameSize[Handle.Right] = clamp(size, min, max);
    }

  },
  async created() {
    // Import settings
    let settings;
    const baseUrl = `${ import.meta.env.BASE_URL }`;
    if(Browser.getOperatingSystemClass() === OperatingSystem.MacOS) {
      settings = await (await fetch(`${ baseUrl }settings_macos.json`)).json();
    } else {
      settings = await (await fetch(`${ baseUrl }settings_win.json`)).json();
    }
    // Load settings
    await this.application.execute(AppCommands.loadSettings(this.application, settings));
    // Load file from query parameters, if possible
    let params = new URLSearchParams(window.location.search);
    // Load framework from query parameters, if possible
    let frm = params.getAll("framework");
    if(frm.length) {
      // Setup registrations
      const registrations = frm.map(f => {
        AppCommands.registerFrameworkFromUrl(this.application, f)
          .then(cmd => this.application.execute(cmd))
          .catch(ex => {
            console.error(`Failed to register framework from url: '${ frm }'`);
            console.error(ex);
          })
      });
      // Await registrations
      await Promise.all(registrations);
    }
    // Load file from query parameters, if possible
    let src = params.get("src");
    if(src) {
      try {
        await this.application.execute(await AppCommands.loadFileFromUrl(this.application, src));
      } catch(ex) {
        console.error(`Failed to load file from url: '${ src }'`);
        console.error(ex);
      }
    }
  },
  mounted() {
    this.bodyWidth = this.body!.clientWidth;
    this.bodyHeight = this.body!.clientHeight;
    this.onResizeObserver = new ResizeObserver(() => {
      // Update current body size
      this.bodyWidth = this.body!.clientWidth;
      this.bodyHeight = this.body!.clientHeight;
      // Restrict left and right frame
      this.setLeftFrameSize(this.activeFrameSize[Handle.Left]);
      this.setRightFrameSize(this.activeFrameSize[Handle.Right]);
    });
    this.onResizeObserver.observe(this.body!);
  },
  unmounted() {
    this.onResizeObserver?.disconnect();
  },
  components: {
    AppTitleBar, AppHotkeyBox,
    AppFooterBar,
    ViewSidebar,
    MappingFileSearch, MappingFileViewControl,
    ActiveViewSidebar,
    ViewFilterSidebar, ProblemPane
  }
});

</script>


<style>

/** === Global === */

html,
body {
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0px;
  margin: 0px;
  background: #242424;
  overflow: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

p {
  margin: 0px;
}

ul {
  margin: 0px;
  padding: 0px;
}

/** === Main App === */

#app {
  width: 100%;
  height: 100%;
}

#main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

#app-title-bar {
  position: relative;
  flex-shrink: 0;
  height: 31px;
  color: #bfbfbf;
  background: #262626;
  border-bottom: solid 1px #333333;
  z-index: 1;
}

#app-body {
  position: relative;
  flex: 1;
  display: grid;
  overflow: hidden;
  grid-template-rows: minmax(0, 1fr) 27px;
  z-index: 0;
}
#view-sidebar {
  width: 100%;
  height: 100%;
  background: #1c1c1c;
  border-right: solid 1px #333333;
  box-sizing: border-box;
}

#file-search {
  display: flex;
  align-items: center;
  height: 90px;
  width: 100%;
  padding: 0px 40px;
  box-sizing: border-box;
}

#file-editor {
  flex: 1;
  width: 100%;
  padding-left: 30px;
  box-sizing: border-box;
}

#app-footer-bar {
  width: 100%;
  height: 100%;
  color: #bfbfbf;
  border-top: solid 1px #333333;
  box-sizing: border-box;
}

/** === Frames === */

.frame {
  position: relative;
}

.frame.left,
.frame.center,
.frame.right {
  grid-row: 1;
}

.frame.left {
  grid-column: 1;
}

.frame.center {
  display: flex;
  flex-direction: column;
  grid-column: 2;
}

.frame.right {
  grid-column: 3;
}

.frame.bottom {
  grid-column: 1 / 4;
}

/** === Resize Handles === */

.resize-handle {
  position: absolute;
  display: block;
  background: #637bc9;
  transition: 0.15s opacity;
  opacity: 0;
  z-index: 1;
}
.resize-handle:hover {
  transition-delay: 0.2s;
  opacity: 1;
}

.frame.left .resize-handle,
.frame.right .resize-handle {
  top: 0px;
  width: 4px;
  height: 100%;
  cursor: e-resize;
}
.frame.left .resize-handle {
  right: -2px;
}
.frame.right .resize-handle {
  left: -2px;
}

.sidebar-container {
    width: 100%;
  display: flex;
  box-sizing: border-box;
}

</style>
