<template>
  <ScrollBox ref="scrollbox" class="mapping-file-control" @scroll="onScrollPosition" :always-show-scroll-bar="true">
    <div class="editor-contents" :style="contentStyle">
      <template v-for="item of editor.view.visibleItems" :key="item.id">
        <div :class="['item-container', { opaque: isItemOpaque(item) }]" :style="getItemStyle(item)">
          <div class="item-contents">
            <div class="item-padding" :style="getItemPaddingStyle(item)">
              {{ getItemValidity(item) ? "" : "⚠" }}
            </div>
            <component 
              class="item"
              :view="item"
              :is="getItemControl(item)"
              @execute="execute"
              @pointerdown="onPointerDown(item)"
            />
          </div>
          <div class="item-separator" :style="getItemSeparatorStyle(item)">

          </div>
        </div>
      </template>
    </div>
  </ScrollBox>
</template>

<script lang="ts">
// Dependencies
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { clamp } from "@/assets/scripts/Utilities";
import { defineComponent, type PropType } from 'vue';
import { MappingObjectView, MappingFileViewItem, BreakoutSectionView } from "@/assets/scripts/MappingFileEditor";
import type { EditorCommand, MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
// Components
import ScrollBox from "../Containers/ScrollBox.vue"
import BreakoutSectionViewControl from "./BreakoutSectionViewControl.vue";
import MappingObjectViewControl from "./MappingObjectViewControl.vue";

export default defineComponent({
  name: 'MappingFileViewControl',
  props: {
    editor: {
      type: Object as PropType<MappingFileEditor>,
      required: true
    }
  },
  data() {
    return {
      scrollRafId: 0,
      cachedViewPosition: 0,
      onResizeObserver: null as ResizeObserver | null,
    }
  },
  computed: {

    /**
     * Returns the content's style.
     * @returns
     *  The content's style.
     */
    contentStyle(): { height: string } {
      return { height: `${ this.editor.view.contentHeight }px` }
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
     * Item pointer down behavior.
     * @param item
     *  The item selected.
     */
    onPointerDown(item: MappingFileViewItem) {
      if(!(item instanceof MappingObjectView)){
        return;
      }
      this.execute(EditorCommands.unselectAllViewItems(this.editor));
      this.execute(EditorCommands.selectViewItem(item));
      // TODO: Command click should ignore clicks on fields
    },

    /**
     * Scroll behavior.
     * @param position
     *  The scroll's position.
     */
    onScrollPosition(position: number) {
      // Limit scroll event
      if(this.scrollRafId !== 0) {
        return;
      }
      this.scrollRafId = requestAnimationFrame(() => {
        this.scrollRafId = 0;
        this.setScrollPosition(position);
      })
    },

    /**
     * Sets the editor's scroll position.
     * @param position
     *  The scroll position.
     */
    setScrollPosition(position: number) {
      const editor = this.editor;
      if(position !== editor.view.viewPosition) {
        this.cachedViewPosition = position;
        this.execute(EditorCommands.setEditorViewPosition(editor, position));
      }
    },

    /**
     * Sets the editor's view height.
     */
    setEditorViewHeight() {
      // Set editor view height
      const editor = this.editor;
      const height = this.$el.clientHeight;
      this.execute(EditorCommands.setEditorViewHeight(editor, height));
    },

    /**
     * Returns a view item's control type.
     * @param view
     *  The {@link MappingFileViewItem}.
     * @returns
     *  The view item's control type.
     */
    getItemControl(view: MappingFileViewItem): string {
      if(view instanceof MappingObjectView) {
        return "MappingObjectViewControl";
      } else if(view instanceof BreakoutSectionView) {
        return "BreakoutSectionViewControl";
      } else {
        throw new Error(`Cannot render view type '${ 
          view.constructor.name
        }'.`)
      }
    },
    
    /**
     * Returns a view item's style.
     * @param view
     *  The {@link MappingFileViewItem}.
     * @returns
     *  The view item's style.
     */
    getItemStyle(view: MappingFileViewItem): { top: string, height: string, zIndex: string } {
      const baseIndex = view.layer * 2;
      if(view instanceof BreakoutSectionView) {
        const top = clamp(
          this.cachedViewPosition + view.hangHeight,
          view.headOffset,
          view.hangOffset
        );
        return {
          top    : `${ top }px`,
          height : `${ view.height + view.padding }px`,
          zIndex : `${ baseIndex }`
        }
      } else {
        return {
          top    : `${ view.headOffset }px`,
          height : `${ view.height + view.padding }px`,
          zIndex : `${ baseIndex + (view.selected ? 1 : 0) }`
        }
      }
    },

    /**
     * Returns a view item's padding style.
     * @param view
     *  The {@link MappingFileViewItem}.
     * @returns
     *  The view item's padding style.
     */
    getItemPaddingStyle(view: MappingFileViewItem) : { width: string, paddingLeft: string } {
      let width   = view.level === 0 ? 0 : 1;
      let padding = view.level - width;
      return {
        width       : `${ width * 35 }px`,
        paddingLeft : `${ padding * 35 }px`
      }
    },

    /**
     * Returns a view item's separator style.
     * @param view
     *  The {@link MappingFileViewItem}.
     * @returns
     *  The view item's separator style.
     */
    getItemSeparatorStyle(view: MappingFileViewItem) : { height: string } {
      return {
        height : `${ view.padding }px`,
      }
    },

    /**
     * Returns a view item's validity.
     * @param view
     *  The {@link MappingFileViewItem}.
     * @returns
     *  The view item's validity.
     */
    getItemValidity(view: MappingFileViewItem): boolean {
      if(view instanceof MappingObjectView) {
        return view.object.isValid;
      }
      return true;
    },

    /**
     * Tests if an item is opaque.
     * @param view
     *  The view to test.
     * @returns
     *  True if the item is opaque, false otherwise.
     */
    isItemOpaque(view: MappingFileViewItem): boolean {
      return view.level !== (this.editor.view.maxLevel - 1);
    },

  },
  watch: {
    // On editor change
    "editor"() {
      this.setEditorViewHeight();
    },
    // On editor view position change
    "editor.view.viewPosition"() {
      // const lastPosition = this.cachedViewPosition;
      const viewPosition = this.editor.view.viewPosition;
      if(this.cachedViewPosition !== viewPosition) {
        this.cachedViewPosition = viewPosition;
        // Update scroll position
        (this.$refs.scrollbox as any).moveScrollPosition(viewPosition);
        // TODO: Open box which allows user to move view back to cachedViewPosition.
        //       Don't open box if last content height is different from current
        //       content height.
        // setTimeout(() => { 
        //   (this.$refs.scrollbox as any).moveScrollPosition(lastPosition);
        // }, 2000)
      }
    }
  },
  async mounted() {
    // Configure resize observer
    this.onResizeObserver = new ResizeObserver(() => this.setEditorViewHeight());
    this.onResizeObserver.observe(this.$el);
  },
  unmounted() {
    this.onResizeObserver!.disconnect();
  },
  components: { 
    ScrollBox, 
    BreakoutSectionViewControl,
    MappingObjectViewControl
  }
});
</script>
  
<style scoped>

/** === Main Control === */

.editor-contents {
  position: relative;
}

.item-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
  box-sizing: border-box;
}

.item-contents {
  flex: 1;
  display: flex;
}

.item-padding {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e6d845;
  font-size: 12pt;
  font-weight: 600;
  user-select: none;
  height: 100%;
}

.item {
  flex: 1;
  height: 100%;
  box-shadow: 2px 2px 0px 0px rgb(0 0 0 / 15%);
}

.item-separator {
  width: 100%;
}

.opaque {
  background: #242424;
}

/** === Scroll Bar === */

:deep(.scroll-bar) {
  background: #1c1c1c;
  border-top: solid 1px #3b3b3b;
  border-left: solid 1px #333333;
}

</style>
