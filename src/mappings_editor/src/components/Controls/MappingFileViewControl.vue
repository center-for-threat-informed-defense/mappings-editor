<template>
  <div class="mapping-file-control" @pointerdown="onWindowPointerDown">
    <div :class="['editor-contents', editModeClass]" :style="contentStyle" ref="content">
      <template v-for="item of editor.view.visibleItems" :key="item.id">
        <div :class="['item-container', { opaque: isItemOpaque(item) }]" :style="getItemStyle(item)">
          <div class="item-padding" :style="getItemPaddingStyle(item)">
            {{ getItemValidity(item) ? "" : "⚠" }}
          </div>
          <div class="item-contents">
            <component 
              :is="getItemControl(item)"
              :view="item"
              :class="['item', { selected: isItemSelected(item) }]"
              @execute="execute"
              @pointerdown="onItemPointerDown($event, item)"
            />
            <div
              :class="['item-separator', { hovered: isItemHovered(item) }]"
              :style="getItemSeparatorStyle(item)"
            >
            </div>
          </div>
        </div>
      </template>
      <TransitionGroup tag="ul" name="select" class="drag-tooltip" :style="tooltipStyle">
        <template v-for="(item, i) of movingItems.items" :key="item.id">
          <li :style="{ 'transitionDelay': `${ i*30 }ms` }">
            <p class="from">
              <span>{{ item.object.sourceObject.objectId }}</span>
            </p>
            <p class="arrow"></p>
            <p class="to">
              <span>{{ item.object.targetObject.objectId }}</span>
            </p>
          </li>
        </template>
        <template v-if="0 < movingItems.remaining">
          <li :style="{ 'transitionDelay': `${ maxToolTipItems*30 }ms` }">
            <p class="more">
              <span>+{{ movingItems.remaining }} More</span>
            </p>
          </li>
        </template>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { RawScrollBox } from "@/assets/scripts/Utilities/";
import { clamp, PointerTracker } from "@/assets/scripts/Utilities";
import { defineComponent, inject, markRaw, type PropType, toRaw } from 'vue';
import { MappingObjectView, MappingFileViewItem, BreakoutSectionView } from "@/assets/scripts/MappingFileEditor";
import type { EditorCommand, MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
// Components
import ScrollBox from "../Containers/ScrollBox.vue"
import MappingObjectViewControl from "./MappingObjectViewControl.vue";
import BreakoutSectionViewControl from "./BreakoutSectionViewControl.vue";

export default defineComponent({
  name: 'MappingFileViewControl',
  setup() {
    return {
      isHotkeyActive: inject("isHotkeyActive") as 
        (sequence: string, strict?: boolean) => boolean
    }
  },
  props: {
    editor: {
      type: Object as PropType<MappingFileEditor>,
      required: true
    },
    paintSelectKeySequence: {
      type: String,
      required: true
    },
    multiSelectKeySequence: {
      type: String,
      required: true
    },
    maxToolTipItems: {
      type: Number,
      default: 6
    }
  },
  data() {
    return {
      editMode: EditMode.Standard,
      editModeClasses: {
        [EditMode.Standard]    : undefined,
        [EditMode.PaintSelect] : "paint-select-mode",
        [EditMode.ItemMove]    : "item-move-mode"
      },
      cursor: {
        track: markRaw(new PointerTracker()),
        xOffset: 0,
        yOffset: 0,
        lastEvent: null as PointerEvent | null
      },
      paintSelect: {
        selection: new Map<MappingObjectView, boolean>(),
        sourceLocation: 0,
        targetLocation: 0,
        selectState: false
      },
      itemMove: {
        tooltipX: 0,
        tooltipY: 0,
        location: null as MappingFileViewItem | null,
        originPosition: 0 
      },
      cachedViewPosition: 0,
      requestedViewPosition: 0,
      scrollAnimationFrameId: 0,
      onResizeObserver: null as ResizeObserver | null,
      scrollbox: markRaw(new RawScrollBox(true))
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
    },

    /**
     * Returns the move tooltip's style.
     * @returns
     *  The move tooltip's style.
     */
    tooltipStyle(): { transform: string, zIndex: number } {
      const move = this.itemMove;
      const x = Math.round(move.tooltipX);
      const y = Math.round(move.tooltipY);
      return { 
        transform: `translate(${ x }px, ${ y }px )`,
        zIndex: (this.editor.view.maxLayer * 2) + 2
      };
    },

    /**
     * Returns the current edit mode class.
     * @returns
     *  The current edit mode class.
     */
    editModeClass(): string | undefined{
      return this.editModeClasses[this.editMode];
    },

    /**
     * Tests if paint select is enabled.
     * @returns
     *  True if paint select is enabled, false otherwise.
     */
    isPaintSelectEnabled() {
      return this.isHotkeyActive(this.paintSelectKeySequence, true);
    },

    /**
     * Returns the moving {@link MappingObjectView}s.
     * @returns
     *  The moving {@link MappingObjectView}s.
     */
    movingItems(): { items: MappingObjectView[], remaining: number } {
      if(this.editMode !== EditMode.ItemMove) {
        return { items: [], remaining: 0 };
      }
      const items = [...this.editor.view.getItems(
        o => o instanceof MappingObjectView && o.selected
      )] as MappingObjectView[];
      return { 
        items: items.slice(0, this.maxToolTipItems),
        remaining: items.length - this.maxToolTipItems
      } ;
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

    
    ///////////////////////////////////////////////////////////////////////////
    //  1. Selection  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * View item pointer down behavior.
     * @param event
     *  The pointer event.
     * @param item
     *  The selected view item.
     */
    onItemPointerDown(event: PointerEvent, item: MappingFileViewItem) {
      if(!(item instanceof MappingObjectView)){
        return;
      }
      // Perform selection
      let singleSelect;
      if(this.isHotkeyActive(this.multiSelectKeySequence)) {
        if(this.tryMultiselectToItem(item)) {
          return;
        } else {
          singleSelect = true;
        }
      } else {
        singleSelect = !item.selected;
      }
      if(singleSelect) {
        this.execute(EditorCommands.unselectAllMappingObjectViews(this.editor.view));
      }
      this.execute(EditorCommands.selectMappingObjectView(item));
      // Switch to item move mode
      const t = event.target;
      if(t instanceof HTMLElement && t.hasAttribute("move-handle")) {
        this.editMode = EditMode.ItemMove;
      }
    },

    /**
     * Window pointer down behavior.
     * @param event
     *  The pointer event.
     */
    onWindowPointerDown(event: PointerEvent) {
      const view = this.editor.view;
      const content = this.$refs.content as HTMLElement;
      // Update last event
      this.cursor.lastEvent = event;
      // If in paint select mode...
      if(this.editMode === EditMode.PaintSelect) {
        // Capture cursor
        this.cursor.track.capture(
          event,
          e => this.onPaintSelectDrag(e),
          this.onPaintSelectStopDrag,
          content
        );
        // Set source location
        this.paintSelect.sourceLocation = this.getCursorPositionOverContent(event).y;
        // Set selection state
        const point = this.paintSelect.sourceLocation;
        const items = [...view.getItemsAt(point, point)];
        if(items.length) {
          this.paintSelect.selectState = !items[0].selected;
        } else {
          this.paintSelect.selectState = true;
        }
        // Make first selection
        this.onPaintSelectDrag(event);
      }
      // If in item move mode...
      else if(this.editMode === EditMode.ItemMove) {
        const { x, y } = this.getCursorPositionOverContent(event);
        // Show tooltip
        const move = this.itemMove;
        move.tooltipX = x;
        move.tooltipY = y;
        move.originPosition = view.viewPosition;
        // Capture cursor
        this.cursor.track.capture(
          event,
          e => this.onItemMoveDrag(e),
          this.onItemMoveStopDrag,
          content
        );
      }
    },

    /**
     * Paint select drag behavior
     * @param event
     *  The pointer event.
     * @param attemptAutoScroll
     *  If true, auto-scroll will be attempted when cursor exits the editor.
     *  (Default: true)
     */
    onPaintSelectDrag(event: PointerEvent, attemptAutoScroll: boolean = true) {
      event.preventDefault();
      // Update last event
      this.cursor.lastEvent = event;
      // If exited paint select mode...
      if(this.editMode !== EditMode.PaintSelect) {
        // ...do nothing
        return;
      }
      // Clear selection
      const select = this.paintSelect;
      select.selection.clear();
      // Calculate line
      select.targetLocation = this.getCursorPositionOverContent(event).y;
      const beg = Math.min(select.sourceLocation, select.targetLocation);
      const end = Math.max(select.sourceLocation, select.targetLocation);
      // Select items
      for(const item of toRaw(this.editor).view.getItemsAt(beg, end)) {
        if(item instanceof MappingObjectView) {
          select.selection.set(item, select.selectState);
        }
      }
      // Update auto-scroll
      if(attemptAutoScroll){
        this.runAutoScrollIfRequired(event);
      }
    },

    /**
     * Paint select stop drag behavior.
     */
    onPaintSelectStopDrag() {
      // Clear last event
      this.cursor.lastEvent = null;
      // Generate selection
      const cmd = EditorCommands.createGroupCommand();
      for(const [item, selected] of this.paintSelect.selection) {
        if(selected){
          cmd.do(EditorCommands.selectMappingObjectView(item));
        } else {
          cmd.do(EditorCommands.unselectMappingObjectView(item));
        }
      }
      // Clear painted selection
      this.paintSelect.selection.clear();
      // Stop auto-scroll
      this.stopAutoScroll();
      // Execute selection
      this.$emit("execute", cmd);
    },

    /**
     * Gets the cursor's coordinates over the editor's contents.
     * @param event
     *  The pointer event.
     * @returns
     *  The cursor's coordinates over the editor's content.
     */
    getCursorPositionOverContent(event: PointerEvent): { x: number, y: number } {
      const { top, left } = this.$el.getBoundingClientRect();
      const { xOffset, yOffset } = this.cursor;
      return {
        x: event.clientX - (left + xOffset),
        y: event.clientY + this.cachedViewPosition - (top + yOffset)
      }
    },

    /**
     * Attempts to multiselect all view items between the targeted view item
     * and the provided view item. The multiselect will fail if the editor's
     * view has no targeted view item.
     * @param item
     *  The item.
     * @returns
     *  True if the multiselect was successful, false otherwise.
     */
    tryMultiselectToItem(item: MappingFileViewItem): boolean {
      const targetedItem = this.editor.view.lastSelected;
      if(!targetedItem) {
        return false;
      }
      // Resolve selection order
      let beg, end;
      if(targetedItem.baseOffset < item.baseOffset) {
        beg = targetedItem;
        end = item;
      } else {
        beg = item;
        end = targetedItem;
      }
      // Generate selection
      const views = [];
      for(; beg.next && end !== beg.prev; beg = beg.next) {
        if(beg instanceof MappingObjectView) {
          views.push(beg);
        }
      }
      const cmd = EditorCommands.selectMappingObjectViews(views);
      // Execute selection
      this.$emit("execute", cmd);
      return true;
    },

        
    ///////////////////////////////////////////////////////////////////////////
    //  2. Item Movement  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Item move drag behavior
     * @param event
     *  The pointer event.
     * @param attemptAutoScroll
     *  If true, auto-scroll will be attempted when cursor exits the editor.
     *  (Default: true)
     */
    onItemMoveDrag(event: PointerEvent, attemptAutoScroll: boolean = true) {
      event.preventDefault();
      // Update last event
      this.cursor.lastEvent = event;
      // If exited item move mode...
      if(this.editMode !== EditMode.ItemMove) {
        // ...do nothing
        return;
      }
      // Position tooltip
      const { x, y } = this.getCursorPositionOverContent(event);
      const move = this.itemMove;
      move.tooltipX = x;
      move.tooltipY = y;
      // Resolve location
      const item = [...this.editor.view.getItemsAt(y, y)][0];
      if(item && !item.selected) {
        move.location = item;
      } else {
        move.location = null;
      }
      // Update auto-scroll
      if(attemptAutoScroll) {
        this.runAutoScrollIfRequired(event);
      }
    },

    /**
     * Item move stop drag behavior.
     */
    onItemMoveStopDrag() {
      const move = this.itemMove;
      // Clear last event
      this.cursor.lastEvent = null;
      // Generate move
      let cmd = null;
      if(move.location) {
        const v = this.editor.view;
        const p = move.originPosition;
        const d = move.location as MappingFileViewItem;
        cmd = EditorCommands.moveSelectedMappingObjectViews(v, d, p);
      }
      // Clear location
      move.tooltipX = 0;
      move.tooltipY = 0;
      move.location = null;
      // Exit item move mode
      this.editMode = EditMode.Standard;
      // Stop auto-scroll
      this.stopAutoScroll();
      // Execute move
      if(cmd) {
        this.$emit("execute", cmd);
      }
    },

    
    ///////////////////////////////////////////////////////////////////////////
    //  3. Scrolling  /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Scroll behavior.
     * @param position
     *  The scroll's position.
     */
    onScrollPosition(position: number) {
      
      /**
       * Developer's Note:
       * If we set `cachedViewPosition` outright, we'll trigger an extra patch
       * before the main patch in requestAnimationFrame(). We can avoid this
       * extra patch (and improve scroll performance) by storing the scroll
       * position in a variable with no dependant computed properties or
       * methods (`requestedViewPosition`).  
       */

      // Update requested view position
      this.requestedViewPosition = clamp(position, 0, this.editor.view.maxPosition);
      // If scroll frame already scheduled...
      if(this.scrollAnimationFrameId !== 0) {
        // ...bail
        return;
      }
      // Schedule scroll frame
      this.scrollAnimationFrameId = requestAnimationFrame(() => {
        this.scrollAnimationFrameId = 0;
        // Set Scroll Position
        this.setScrollPosition(this.requestedViewPosition);
        // Run drag functions
        this.rerunDragFunctions();
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
        this.cachedViewPosition = clamp(position, 0, editor.view.maxPosition);
        this.execute(EditorCommands.setMappingFileViewPosition(editor.view, position));
      }
    },

    /**
     * Synchronizes the view's scroll position with the editor's.
     * @param suggestReturn
     *  If true, the user will receive a prompt allowing them to return to the
     *  view's original scroll position.
     */
    syncScrollPosition(suggestReturn: boolean = false) {
      // const lastPosition = this.cachedViewPosition;
      const viewPosition = this.editor.view.viewPosition;
      if(this.cachedViewPosition !== viewPosition) {
        this.cachedViewPosition = viewPosition;
        // After DOM update...
        this.$nextTick(() => {
          // Update scroll position
          this.scrollbox.moveScrollPosition(viewPosition);
          // TODO:
          // Display button which allows user to move view back to
          // lastPosition. Don't display button if last content height is
          // different from current content height.
          // setTimeout(() => { 
          //   scrollbox.moveScrollPosition(lastPosition);
          // }, 2000)
        });
      }
    },

    /**
     * Sets the editor's view height.
     */
    setEditorViewHeight() {
      // Set editor view height
      const editor = this.editor;
      const height = this.$el.clientHeight;
      this.execute(EditorCommands.setMappingFileViewHeight(editor.view, height));
    },

    /**
     * Conditionally starts or stops auto-scrolling given the cursor's position
     * over the editor's scroll window.
     * @param event
     *  The cursor's pointer event.
     */
    runAutoScrollIfRequired(event: PointerEvent) {
      const scrollbox = this.$el;
      const { top, bottom } = scrollbox.getBoundingClientRect();
      if(event.clientY < top) {
        const speed = event.clientY - top;
        this.startAutoScroll(speed);
      } else if(bottom <= event.clientY) {
        const speed = event.clientY - bottom;
        this.startAutoScroll(speed);
      } else {
        this.stopAutoScroll();
      }
    },

    /**
     * Starts auto-scrolling.
     * @param speed
     *  The scroll speed (in pixels.)
     * @param event
     *  The pointer event that triggered auto-scrolling.
     */
    startAutoScroll(speed: number) {
      cancelAnimationFrame(this.scrollAnimationFrameId);
      // Configure scroll function
      const scroll = () => {
        // Calculate scroll position
        const viewPosition = Math.round(this.editor.view.viewPosition + speed);
        // Update scroll position
        this.scrollbox.moveScrollPosition(viewPosition);
        this.setScrollPosition(viewPosition);
        // Run drag functions
        this.rerunDragFunctions();
        // Schedule next scroll frame
        this.scrollAnimationFrameId = requestAnimationFrame(scroll);
      }
      // Schedule scroll frame
      this.scrollAnimationFrameId = requestAnimationFrame(scroll);
    },

    /**
     * Stops auto-scrolling.
     */
    stopAutoScroll() {
      cancelAnimationFrame(this.scrollAnimationFrameId);
      this.scrollAnimationFrameId = 0;
    },

    /**
     * Reruns any active drag functions. 
     */
    rerunDragFunctions() {
      if(this.cursor.lastEvent) {
        this.onPaintSelectDrag(this.cursor.lastEvent, false);
        this.onItemMoveDrag(this.cursor.lastEvent, false);
      }
    },

    
    ///////////////////////////////////////////////////////////////////////////
    //  4. View Item Layout  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


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
      const isLastSelected = view.id === this.editor.view.lastSelected?.id;
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
          zIndex : `${ baseIndex + (isLastSelected ? 1 : 0) }`
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
    getItemPaddingStyle(view: MappingFileViewItem) : { width: string, padding: string } {
      const width = view.level * 35;
      const paddingLeft = view.level ? (view.level - 1) * 35 : 0;
      return {
        width   : `${ width }px`,
        padding : `0px 0px ${ view.padding }px ${ paddingLeft }px`
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
        return view.object.isValid.value;
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

    /**
     * Tests if an item is selected.
     * @param view
     *  The view to test.
     * @returns
     *  True if the item is selected, false otherwise.
     */
    isItemSelected(view: MappingFileViewItem): boolean {
      return this.paintSelect.selection.get(view as MappingObjectView) ?? view.selected;
    },

    /**
     * Tests if an item is hovered.
     * @param view
     *  The view to test.
     * @returns
     *  True if the item is hovered, false otherwise.
     */
    isItemHovered(view: MappingFileViewItem): boolean {
      return view === this.itemMove.location;
    }

  },
  watch: {
    // On editor change
    "editor"() {
      this.setEditorViewHeight();
    },
    // On editor view position change
    "editor.view.viewPosition"() {
      this.syncScrollPosition(true);
    },
    // On paint select change
    "isPaintSelectEnabled"() {
      const inStandardMode = this.editMode === EditMode.Standard;
      const inPaintSelectMode = this.editMode === EditMode.PaintSelect;
      if(inStandardMode || inPaintSelectMode) {
          if(this.isPaintSelectEnabled) {
            this.editMode = EditMode.PaintSelect;
          } else {
            this.editMode = EditMode.Standard;
          }
      }
    }
  },
  mounted() {
    // Mount scrollbox
    this.scrollbox.mount(
      this.$el,
      this.$refs.content as HTMLElement,
      this.$options.__scopeId,
      this.onScrollPosition
    );
    // Calculate cursor x and y offset
    const cs = getComputedStyle(this.$el);
    this.cursor.yOffset = parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth);
    this.cursor.xOffset = parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
    // Configure resize observer
    this.onResizeObserver = new ResizeObserver(() => this.setEditorViewHeight());
    this.onResizeObserver.observe(this.$el);
    // Synchronize scroll position
    this.syncScrollPosition();

  },
  unmounted() {
    // Destroy scrollbox
    this.scrollbox.destroy();
    // Disconnect resize observer
    this.onResizeObserver!.disconnect();
  },
  components: { 
    ScrollBox, 
    BreakoutSectionViewControl,
    MappingObjectViewControl
  }
});

enum EditMode {
  Standard,
  PaintSelect,
  ItemMove
}

</script>
  
<style scoped>

/** === Main Control === */

.editor-contents {
  position: relative;
}

.item-container {
  display: flex;
  position: absolute;
  width: 100%;
  box-sizing: border-box;
}

.item-container.opaque {
  background: #242424;
}

.item-contents {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0px;
}

.item-padding {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e6d845;
  font-size: 12pt;
  font-weight: 600;
  user-select: none;
  height: 100%;
  box-sizing: border-box;
}

.item {
  flex: 1;
  width: 100%;
  transition-duration: .15s;
  transition-property: opacity, transform;
  box-shadow: 2px 2px 0px 0px rgb(0 0 0 / 15%);
}

.item.selected {
  border-color: #637bc9;
}

.item-separator {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.item-separator.hovered::after {
  content: "";
  position: relative;
  display: block;
  left: -10px;
  width: calc(100% + 10px);
  border-top: dashed 2px #637bc9;
}

/** === Scroll Bar === */

.mapping-file-control .scroll-bar {
  background: #1c1c1c;
  border-top: solid 1px #3b3b3b;
  border-left: solid 1px #333333;
}

/** === Paint Select Mode === */

.paint-select-mode {
  cursor: crosshair;
}

.paint-select-mode * {
  pointer-events: none;
  user-select: none;
}

/** === Item Move Mode === */

.item-move-mode {
  cursor: grabbing;
}

.item-move-mode :deep(*[move-handle]) {
  cursor: grabbing !important;
}

.item-move-mode .item.selected {
  opacity: 0.55;
  transform: scale(0.995);
  border-color: #3b3b3b;
  transition: all .15s;
}

.drag-tooltip {
  position: absolute;
  top: 0px;
  left: -220px;
  width: 220px;
  pointer-events: none;
}

.drag-tooltip li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 11px minmax(0, 1fr);
  height: 22px;
  padding: 3px;
  border: solid 1px #3b3b3b;
  border-radius: 4px;
  background: #2a2a2a;
  box-shadow: 0px 0px 4px 4px rgb(0 0 0 / 15%);
  margin-bottom: 3px;
  list-style: none;
  overflow: hidden;
}

.drag-tooltip li p {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  height: 100%;
}

.drag-tooltip li p.from,
.drag-tooltip li p.to {
  font-family: "DM Mono";
  font-size: 8.5pt;
  font-weight: 500;
}

.drag-tooltip li p.from {
  grid-column: 1;
  color: #d9d9d9;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  background: #637bc9;
}

.drag-tooltip li p.arrow {
  grid-column: 2;
  position: relative;
  overflow: hidden;
}

.drag-tooltip li p.arrow::after {
  content: "";
  position: absolute;
  display: block;
  left: -8px;
  width: 16px;
  height: 16px;
  background: #637bc9;
  transform: rotate(45deg);
}

.drag-tooltip li p.to {
  grid-column: 3;
  color: #bfbfbf;
}

.drag-tooltip li p.more {
  grid-column: 1 / 4;
  color: #d9d9d9;
  font-size: 9.5pt;
  font-weight: 600;
  border-radius: 3px;
  background: #637bc9;
}

.drag-tooltip li span {
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0px 10px;
  box-sizing: border-box;
  overflow: hidden;
}

li.select-enter-active {
  transition: all 0.20s;
}
li.select-leave-active {
  transition: all 0.15s;
  transition-delay: 0ms !important;
}

li.select-enter-from {
  opacity: 0;
  transform: scale(.95);
}
li.select-leave-to {
  opacity: 0;
}

</style>
