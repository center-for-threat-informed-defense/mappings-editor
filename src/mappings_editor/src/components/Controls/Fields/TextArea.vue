<template>
  <div :class="['text-area', { 'with-scrollbar': alwaysShowScrollBar || showScrollbar }]">
    <textarea
      type="text"   
      ref="textarea"
      name="textarea"
      :value="modelValue"
      :placeholder="placeholder"
      @keyup.stop
      @keydown.stop
      @input="onInput"
      @wheel.passive="onScrollWheel"
      @scroll="onScrollContent"
    ></textarea>
    <div
      ref="scrollbar"
      class="scroll-bar"
      @wheel.passive="onScrollWheel"
      v-show="alwaysShowScrollBar || showScrollbar"
    >
      <div
        class="scroll-handle"
        :style="handleStyle"
        @pointerdown="startDrag"
        v-show="showScrollbar"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { PointerTracker, clamp } from "@/assets/scripts/Utilities";
import { defineComponent, markRaw, ref } from "vue";

export default defineComponent({
  name: "TextArea",
  setup() {
    return { 
      textarea: ref<HTMLElement | null>(null),
      scrollbar: ref<HTMLElement | null>(null),
    }
  },
  props: {
    modelValue: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: "-"
    },
    alwaysShowScrollBar: {
      type: Boolean,
      default: false
    },
    propagateScroll: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      scrollTop: 0,
      windowMax: 0,
      handle: {
        trk: markRaw(new PointerTracker()),
        hei: 0, 
        max: 0, 
        pos: 0,
      },
      showScrollbar: false,
      onResizeObserver: null as ResizeObserver | null
    }
  },
  computed: {

    /**
     * Returns the scroll handle's style.
     * @returns
     *  The scroll handle's style.
     */
    handleStyle(): { height: string, transform: string } {
      return {
        height: `${ this.handle.hei }px`,
        transform: `translateY(${ this.handle.pos }px)`
      } 
    }

  },
  emits: ["update:modelValue", "scroll", "input"],
  methods: {

    /**
     * Scroll wheel behavior.
     * @param event
     *  The wheel event.
     */
    onScrollWheel(event: WheelEvent) {
      this.moveScrollPosition(this.scrollTop + event.deltaY, event);
    },

    /**
     * Scroll handle drag start behavior.
     * @param event
     *  The pointer event.
     */
    startDrag(event: PointerEvent) {
      this.handle.trk.capture(event, this.onDrag);
    },

    /**
     * Scroll handle drag behavior.
     * @param event
     *  The pointer event.
     * @param track
     *  The mouse tracker.
     */
    onDrag(event: PointerEvent, track: PointerTracker) {
      event.preventDefault();
      this.moveScrollPosition(
        this.handleTopToTop(this.handle.pos + track.movementY)
      );
    },

    /**
     * Scroll content behavior.
     */
    onScrollContent() {
      if(!this.textarea) {
        return;
      }
      // If browser changed scroll position on its own, update scroll state
      if(this.textarea.scrollTop != this.scrollTop) {
        this.scrollTop = this.textarea!.scrollTop;
        this.handle.pos = this.topToHandleTop(this.scrollTop);
      }
      this.$emit("scroll", this.scrollTop);
    },

    /**
     * Calculates and configures the parameters required to mimic scrolling.
     * 
     * NOTE:
     * This function should be called anytime:
     *  - The height of the scroll box changes.
     *  - The height of the scroll content changes.
     * 
     * @param resetTop
     *  [true]
     *   The scroll position will be set to 0, after recalculation.
     *  [false]
     *   The scroll position will go to its original spot, after recalculation.
     *  (Default: true)
     */
    recalculateScrollState(resetTop: boolean = true) {
      let showScrollbar = this.showScrollbar;
      let content = this.textarea;
      // Ignore scroll content with no height
      if(!content || content.clientHeight === 0) {
        this.showScrollbar = false;
        return;
      }
      // Compute ratio
      let ratio = content.clientHeight / content.scrollHeight;
      // Compute scroll parameters
      let scrollBarSpace = this.getScrollBarHeight();
      this.handle.hei = Math.max(15, Math.round(scrollBarSpace * ratio));
      this.handle.max = scrollBarSpace - this.handle.hei;
      this.windowMax  = content.scrollHeight - content.clientHeight;
      // Update scroll handle
      this.showScrollbar = ratio !== 1;
      // Update scroll position
      this.moveScrollPosition(resetTop ? 0 : content.scrollTop);
      // If scrollbar added, recalculate state after scrollbar applied
      if(!showScrollbar && this.showScrollbar) {
        setTimeout(() => this.recalculateScrollState(resetTop), 0);
      }
    },

    /**
     * Moves the scroll position.
     * @param position
     *  The new scroll position.
     * @param event
     *  The scroll wheel event, if applicable.
     */
    moveScrollPosition(position: number, event: WheelEvent | null = null) {
      if(!this.textarea) {
        return;
      }
      let scrollTop = this.scrollTop;
      this.scrollTop = clamp(Math.round(position), 0, this.windowMax);
      this.handle.pos = this.topToHandleTop(this.scrollTop);
      this.textarea.scrollTop = this.scrollTop;
      // Selectively propagate scroll event
      let canMove = 0 < this.scrollTop && this.scrollTop < this.windowMax;
      let hasMoved = scrollTop - this.scrollTop !== 0;
      let shouldStopPropagate = !this.propagateScroll && this.showScrollbar;
      if(shouldStopPropagate || hasMoved || canMove) {
        event?.stopPropagation();
      }
    },
    
    /**
     * Calculates the scroll handle position from the scroll position.
     * @param top
     *  The current scroll position.
     * @returns
     *  The calculated scroll handle position.
     */
    topToHandleTop(top: number): number {
      return (top / this.windowMax) * this.handle.max;
    },

    /**
     * Calculates the scroll position from the scroll handle position.
     * @param top
     *  The current scroll handle position.
     * @returns
     *  The calculated scroll position.
     */
    handleTopToTop(top: number): number {
      return (top / this.handle.max) * this.windowMax;
    },

    /**
     * Returns the scrollbar's height (excluding padding, borders, and margin).
     * @returns
     *  The scrollbar's true height.
     */
    getScrollBarHeight(): number {
      if(this.scrollbar) {
        let cs = getComputedStyle(this.scrollbar);
        let padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        return this.scrollbar.clientHeight - padding;
      } else {
        return 0;
      }
    },

    /**
     * Text area input behavior.
     */
    onInput(event: InputEvent) {
      this.recalculateScrollState(false);
      let value = (event.target as any).value;
      this.$emit('update:modelValue', value);
      this.$emit('input', value);
    }
    
  },
  watch: {
    // On value change
    modelValue(){
      requestAnimationFrame(() => {
        this.recalculateScrollState(false);
      });
    }
  },
  mounted() {
    // Configure resize observer
    this.onResizeObserver = new ResizeObserver(() =>
      this.recalculateScrollState(false)
    );
    this.onResizeObserver.observe(this.$el);
    // Calculate scroll state
    this.recalculateScrollState(false);
  },
  unmounted() {
    // Disconnect resize observer
    this.onResizeObserver!.disconnect();
  },
  components: { }
});
</script>

<style scoped>

/** === Main Field === */

.text-area {
  display: flex;
}

textarea {
  flex: 1;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  height: 100%;
  border: none;
  border-radius: 3px;
  box-sizing: border-box;
  background: none;
  resize: none;
  overflow: hidden;
}

textarea::placeholder {
  color: #999;
}

textarea:focus {
  outline: none;
}

.scroll-bar {
  flex-shrink: 0;
  width: 17px;
  padding: 2px;
  box-sizing: border-box;
}

.scroll-handle {
  border: solid 1px #404040;
  border-radius: 3px;
  box-sizing: border-box;
  background: #333333;
}

</style>
