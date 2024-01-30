<template>
  <div class="app-footer-bar-element">
    <div class="right-align" v-if="!isPhantomFile">
      <div class="metric">
        {{ mappingCount }} Mappings
      </div>
      <div class="metric">
        {{ groupCount }} Groups
      </div>
      <div class="metric" v-if="0 < selectCount">
        {{ selectCount }} Selected
      </div>
      <Transition name="fade">
        <div :class="['metric', { error: hasAutosaveFailed }]" v-if="lastAutosave">
          <FloppyDisk class="icon"/>
          <Transition name="fade" mode="out-in">
            <span v-if="showAutosaveTime">{{ lastAutosave }}</span>
            <span v-else-if="hasAutosaveFailed">FAILED TO AUTOSAVE</span>
            <span v-else>Autosaved</span>
          </Transition>
        </div>
      </Transition>
    </div>
    <div class="left-align" v-if="!isPhantomFile">
      <div class="metric source-framework">
        <span class="framework">{{ sourceFramework }}:</span>
        <span class="version">{{ sourceVersion }}</span>
      </div>
      <div class="metric target-framework">
        <span class="framework">{{ targetFramework }}:</span>
        <span class="version">{{ targetVersion }}</span>
      </div>
      <div class="metric mapping-validity valid" v-if="invalidMappingsCount === 0">
        <span class="icon">✓</span>All Mappings Valid
      </div>
      <div class="metric mapping-validity warning" v-else>
        <span class="icon">⚠</span>{{ invalidMappingsCount }} Invalid Mappings
      </div>
    </div>
  </div>
</template>
    
<script lang="ts">
// Dependencies
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";
// Components
import FloppyDisk from "@/components/Icons/FloppyDisk.vue";
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";

export default defineComponent({
  name: "AppFooterBar",
  data() {
    return {
      application: useApplicationStore(),
      showAutosaveTime: false,
      showAutosaveTimeTimeoutId: 0
    };
  },
  computed: {

    /**
     * Returns the number of mappings in the active file.
     * @returns
     *  The number of mappings in the active file.
     */
    mappingCount(): number {
      return this.application.activeEditor.file.mappingObjects.size;
    },

    /**
     * Returns the number of groups in the active file.
     * @returns
     *  The number of groups in the active file.
     */
    groupCount(): number {
      return this.application.activeEditor.file.mappingGroups.value.size;
    },

    /**
     * Returns the number of selected mappings in the active view.
     * @returns
     *  The number of selected mappings in the active view.
     */
    selectCount(): number {
      return this.application.activeEditor.view.selected.size;
    },

    /**
     * Returns the last time the active editor autosaved.
     * @returns
     *  The last time the active editor autosaved.
     */
    lastAutosave(): string | null {
      const time = this.application.activeEditor.lastAutosave;
      if(time === null) {
        return null;
      } else if(Number.isNaN(time.getTime())) {
        return "ERROR"
      } else {
        return time.toLocaleString();
      }
    },

    /**
     * Tests if the last autosave failed.
     * @returns
     *  True if the last autosave failed, false otherwise.
     */
    hasAutosaveFailed(): boolean {
      const time = this.application.activeEditor.lastAutosave;
      return time !== null && Number.isNaN(time.getTime());
    },

    /**
     * Returns the active file's source framework.
     * @returns
     *  The active file's source framework.
     */
    sourceFramework(): string {
      return this.normalize(this.application.activeEditor.file.sourceFramework);
    },

    /**
     * Returns the active file's source version.
     * @returns
     *  The active file's source version.
     */
    sourceVersion(): string {
      return this.application.activeEditor.file.sourceVersion;
    },

    /**
     * Returns the active file's target framework.
     * @returns
     *  The active file's target framework.
     */
    targetFramework(): string {
      return this.normalize(this.application.activeEditor.file.targetFramework);
    },

    /**
     * Returns the active file's target version.
     * @returns
     *  The active file's target version.
     */
    targetVersion(): string {
      return this.application.activeEditor.file.targetVersion;
    },

    /**
     * Returns the number of invalid mapping objects in the active view.
     * @returns
     *  The number of invalid mappings object in the active view.
     */
    invalidMappingsCount(): number {
      return this.application.activeEditor.invalidObjects.size;
    },

    /**
     * Tests if the active file is the phantom file.
     * @returns
     *  True if the active file is the phantom file, false otherwise.
     */
    isPhantomFile(): boolean {
      return this.application.activeEditor.id === MappingFileEditor.Phantom.id;
    }

  },
  methods: {

    /**
     * Replaces a string's `_` with spaces and casts the string to upper case.
     * @param str
     *  The string to normalize.
     * @returns
     *  The normalized string.
     */
    normalize(str: string) {
      return str.replace(/_/g, " ").toLocaleUpperCase();
    }

  },
  watch: {
    "lastAutosave"() {
      // Clear timer
      clearTimeout(this.showAutosaveTimeTimeoutId);
      // Show time
      this.showAutosaveTime = true;
      // Set timer
      this.showAutosaveTimeTimeoutId = setTimeout(() => {
        // Hide time
        this.showAutosaveTime = false;
      }, 2500)
    }
  },
  components: { FloppyDisk }
});
</script>
    
<style scoped>

/** === Main Element === */

.app-footer-bar-element {
  display: flex;
  user-select: none;
}

.right-align {
  flex: 1;
  display: flex;
  justify-content: baseline;
}

.left-align {
  flex: 1;
  display: flex;
  justify-content: end;
}

.metric {
  display: flex;
  align-items: center;
  color: #cccccc;
  font-size: 9.5pt;
  margin: 0px 10px;
}

.right-align .metric:first-child {
  margin-left: 20px;
}

.left-align .metric:last-child {
  margin-right: 20px;
}

.icon {
  margin-right: 8px;
}

.valid {
  color: #2bd463;
}

.valid .icon {
  fill: #2bd463;
}

.warning {
  color: #e6d846;
}

.warning .icon {
  fill: #e6d846;
}

.error {
  color: #ff4d4d;
  font-weight: 800;
}

.error .icon {
  fill: #ff4d4d;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/** === Framework Metrics === */

.source-framework,
.target-framework {
  font-size: 9pt;
  font-weight: 500;
}

.version {
  margin-left: 4px;
  font-weight: 700;
}

/** === Validity Metrics === */

.mapping-validity {
  font-weight: 500;
}

</style>
