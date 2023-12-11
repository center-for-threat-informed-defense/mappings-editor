<template>
  <ul class="breakout-controller" ref="breakouts">
    <li class="breakout" v-for="[key, breakout] of control.options" :key="key">
      <div class="reorder-handle" @pointerdown="onStartDrag(key, $event)">
        <MoveDots />
      </div>
      <div class="checkbox-bar" name="checkbox" @click="onClickBreakout(key, breakout)">
        <CheckboxBar :text="breakout.text" :checked="breakout.enabled" />
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
// Dependencies
import { clamp } from "@/assets/scripts/Utilities";
import { PointerTracker } from "@/assets/scripts/Utilities/PointerTracker";
import { defineComponent, markRaw, type PropType } from "vue";
import type { BreakoutControl } from "@/assets/scripts/MappingFileEditor";
// Components
import MoveDots from "@/components/Icons/MoveDots.vue";
import CheckboxBar from "./CheckboxBar.vue";

export default defineComponent({
  name: "TabularField",
  props: {
    control: {
      type: Object as PropType<BreakoutControl>,
      required: true
    }
  },
  data() {
    return {
      track: markRaw(new PointerTracker())
    }
  },
  emits: ["execute"],
  methods: {

    /**
     * Breakout click behavior.
     * @param id
     *  The breakout's id.
     * @param breakout
     *  The breakout's state.
     */
    onClickBreakout(id: number, breakout: { enabled: boolean }) {
      let cmd;
      if(breakout.enabled) {
        cmd = EditorCommands.disableBreakout(this.control, id);
      } else {
        cmd = EditorCommands.enableBreakout(this.control, id);
      }
      this.$emit("execute", cmd);
    },

    /**
     * Breakout start drag behavior.
     * @param id
     *  The breakout's id.
     * @param event
     *  The pointer event.
     */
    onStartDrag(id: number, event: PointerEvent) {
      let row = (event.target! as HTMLElement).closest("li")!;
      let breakouts = this.$refs.breakouts as HTMLElement;
      // Configure row classes
      for(let el of breakouts.children) {
        if(el === row) {
          el.classList.add("grabbed");
        } else {
          el.classList.add("not-grabbed");
        }
      }
      // Resolve row bounds
      let rows: { el: Element, minY: number, maxY: number }[] = [];
      for(let row of breakouts.children) {
        let { height } = row.getBoundingClientRect();
        rows.push({ 
          el: row,
          minY: (row as any).offsetTop,
          maxY: (row as any).offsetTop + height
        });
      }
      // Resolve row index
      let src = [...breakouts.children].indexOf(row);
      // Resolve row min and max
      let min = rows[0]!.minY - rows[src].minY;
      let max = rows[rows.length-1]!.maxY - rows[src].maxY;
      // Capture pointer
      let state = { id, src, dst: src, min, max, rows };
      this.track.capture(
        event, 
        (_, track) => {
          this.onDrag(track, state);
        }, 
        () => {
          this.onStopDrag(state);
        });
    },

    /**
     * Breakout drag behavior.
     * @param track
     *  The mouse tracker.
     * @param state
     *  The drag state.
     */
    onDrag(track: PointerTracker, state: any) {
      let { src, min, max, rows } = state;
      let row = rows[src].el;
      // Determine row position
      let y = clamp(track.deltaY, min, max);
      // Apply row position
      row.style.transform = `translate(0px, ${ y }px)`;
      // Swap rows
      let bounds = row.getBoundingClientRect();
      // let minY = bounds.y;
      let minY = (row as any).offsetTop + y;
      let maxY = minY + bounds.height;
      let height = (maxY - minY) + 8;
      // Configure dst index
      state.dst = state.src;
      // Swap rows above index
      for(let i = 0, s = false; i < src; i++) {
        let r = rows[i];
        if(!s && minY <= r.maxY && maxY >= r.minY) {
          state.dst = i;
          s = true;
        }
        let tx = s ? `translate(0px, ${ height }px)` : "";
        r.el.style.transform = tx;
      }
      // Swap rows below index
      for(let i = rows.length - 1, s = false; i > src; i--) {
        let r = rows[i];
        if(!s && minY <= r.maxY && maxY >= r.minY) {
          state.dst = i;
          s = true;
        }
        let tx = s ? `translate(0px, -${ height }px)` : "";
        r.el.style.transform = tx;
      }
    },

    /**
     * Breakout stop drag behavior.
     * @param state
     *  The drag state.
     */
    onStopDrag(state: any) {
      let { id, src, dst, rows } = state;
      // Clear row css
      for(let r of rows) {
        r.el.classList.remove("grabbed", "not-grabbed");
        r.el.style.transform = "";
      }
      // If no movement
      if(src === dst) {
        return;
      }
      // If movement
      let cmd = EditorCommands.moveBreakout(this.control, id, dst);
      this.$emit("execute", cmd);
    }

  },
  components: { MoveDots, CheckboxBar }
});
</script>

<style scoped>

/** === Main Control === */

.breakout-controller {
  width: 100%;
}

.breakout {
  display: flex;
  list-style: none;
  height: 31px;
  margin-bottom: 8px;
  transition: .15s opacity;
  cursor: pointer;
}

.breakout:last-child {
  margin-bottom: 0px;
}

.breakout.grabbed {
  position: relative;
  z-index: 1;
}

.breakout.not-grabbed {
  transition: .15s all;
  opacity: 0.55;
}

.reorder-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 100%;
  border: solid 1px #333333;
  border-radius: 3px;
  box-sizing: border-box;
  margin-right: 6px;
  background: #242424;
  cursor: grab;
}

.breakout.grabbed .reorder-handle {
  cursor: grabbing;
}

.checkbox-bar {
  flex: 1;
}

</style>
