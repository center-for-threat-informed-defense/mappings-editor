<template>
  <div :class="['framework-options-list-field', { flip }]">
    <ScrollBox class="scrollbox" ref="scrollbox" :style="optionsStyle" :propagate-scroll="false">
      <ul class="options" v-if="hasOptions">
        <li 
          ref="items"
          v-for="option in options"
          :key="option.objIdText"
          :list-id="option.objId"
          :class="{ active: isActive(option), null: isNull(option) }"
          @pointerdown="$emit('select', option.objId)"
          @mouseenter="setActive(option)"
          exit-focus-box
        >
          <div class="object-id" :style="objectIdStyle">
            <p>{{ option.objIdText }}</p>
          </div>
          <div class="object-text">
            <p>{{ option.objText}}</p>
          </div>
        </li>
      </ul>
      <div class="no-options" v-else>
        No results found
      </div> 
    </ScrollBox>
  </div>
</template>

<script lang="ts">
// Dependencies
import { defineComponent, type PropType } from "vue";
// Components
import ScrollBox from "@/components/Containers/ScrollBox.vue";

export default defineComponent({
  name: "FrameworkOptionsList",
  props: {
    options: {
      type: Array as PropType<FrameworkOption[]>,
      required: true
    },
    select: {
      type: String as PropType<string | null>
    },
    maxHeight: {
      type: Number,
      default: 211
    },
    maxIdLength: {
      type: Number,
      default: 9
    }
  },
  data() {
    return {
      flip: false
    }
  },
  computed: {

    /**
     * Tests if there are any options available.
     * @returns
     *  True if there are options available, false otherwise.
     */
    hasOptions() {
      return 0 < this.options.length;
    },

    /**
     * Returns the object id style.
     * @returns
     *  The object id style.
     */
    objectIdStyle(): { width: string } {
      // +30 for containers padding
      return { width: `${ (this.maxIdLength * 7) + 30 }px` };
    },

    /**
     * Returns the option list's style.
     * @returns
     *  The option list's style.
     */
    optionsStyle(): { maxHeight: string } {
      return { maxHeight: `${ this.maxHeight }px` };
    }

  },
  emits: ["hover", "select"],
  methods: {

    /**
     * Tests if an option is the null option.
     * @returns
     *  True if the options is the null option, false otherwise.
     */
    isNull(option: FrameworkOption) {
      return option.objId === null
    },

    /**
     * Tests if an option is active.
     * @returns
     *  True if the option is active, false otherwise.
     */
    isActive(option: FrameworkOption) {
      return this.select === option.objId;
    },

    /**
     * Sets the active option.
     * @param option
     *  The option.
     */
    setActive(option: FrameworkOption) {
      this.$emit("hover", option.objId);
    },

    /**
     * Brings an item into focus at the top of the list.
     * @param objectId
     *  The object id to bring into focus.
     */
    focusItemTop(objectId: string | null) {
      let item = this.getItemElement(objectId);
      // Update scroll position
      if(item) {
        // -6px for the <ul>'s padding
        (this.$refs.scrollbox as any)
          .moveScrollPosition(item.offsetTop - 6)
      }
    },

    /**
     * Brings an item into focus.
     * @param objectId
     *  The object id to bring into focus.
     */
    bringItemIntoFocus(objectId: string | null) {
      let item = this.getItemElement(objectId);
      let scrollbox = this.$refs.scrollbox as any;
      // Update scroll position
      if(item) {
        let { top: itTop, bottom: itBottom } = item.getBoundingClientRect();
        let { top: elTop, bottom: elBottom } = scrollbox.$el.getBoundingClientRect();
        // -6px for the <ul>'s padding
        if((itTop - 6) < elTop) {
          scrollbox.moveScrollPosition(item.offsetTop - 6)
        }
        // -7px for the <ul>'s padding and scrollbox border
        else if(elBottom < (itBottom + 7)) {
          let offsetHeight = (elBottom - elTop) - (itBottom - itTop) - 7;
          scrollbox.moveScrollPosition(item.offsetTop - offsetHeight);
        }
      }
    },

    /**
     * Get an item's {@link HTMLElement} from the list.
     * @param objectId
     *  The object id.
     * @returns
     *  The {@link HTMLElement}. `undefined` if the item doesn't exist.
     */
    getItemElement(objectId: string | null): HTMLElement | undefined {
      let item: HTMLElement | undefined = undefined;
      if(!this.$refs.items) {
        return item;
      }
      for(let el of this.$refs.items as HTMLElement[]) {
        if(objectId === el.getAttribute("list-id")) {
          item = el as HTMLElement;
          break;
        }
      }
      return item;
    }

  },
  mounted() {

    /**
     * Developer's Note:
     * If an <FrameworkOptionsList> does not extend past the bottom of the
     * document's body or its parent <ScrollBox>, it's deemed visible. These
     * checks do not account for any other scroll constructs and do not
     * account for nested <ScrollBox>'s. 
     */
    
    // Resolve parent
    let sc = "scroll-content";
    let ele = (this.$refs.scrollbox as any).$el as HTMLElement;
    let par = this.$el.parentElement;
    let body = document.body;
    while(par !== body && !par.classList.contains(sc)) {
      par = par.parentElement;
    }
    // Resolve overlap
    let { bottom: b1 } = par.getBoundingClientRect();
    let { bottom: b2 } = ele.getBoundingClientRect();
    if(b1 < b2) {
      this.flip = true;
    } else {
      this.flip = false;
    }
    // Focus selection
    if(this.select !== undefined) {
      this.focusItemTop(this.select);
    }
  },
  components: { ScrollBox }
});

/**
 * Framework option type
 */
type FrameworkOption = { 
  objId: string | null,
  objIdText: string,
  objText: string
}

</script>

<style scoped>

/** === Main Field === */

.scrollbox {
  position: absolute;
  width: 100%;
  border-width: 1px;
  border-color: #3b3b3b;
  box-sizing: border-box;
  background: #1c1c1c;
}

.framework-options-list-field:not(.flip) .scrollbox-container {
  top: 100%;
  border-style: none solid solid solid;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  box-shadow: 0px 5px 5px -2px rgb(0 0 0 / 20%);
}

.framework-options-list-field.flip .scrollbox-container {
  bottom: 100%;
  border-style: solid solid none solid;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  box-shadow: 0px -5px 5px -2px rgb(0 0 0 / 20%);
}

.scrollbox :deep(.scroll-bar) {
  border-top: none !important;
}

/** === Options List === */

.options {
  position: relative;
  padding: 6px 5px;
}

.options li {
  display: flex;
  list-style: none;
  user-select: none;
  padding: 4px 12px;
  height: 25px;
}

.object-id {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d9d9d9;
  font-family: "DM Mono";
  font-size: 8.5pt;
  font-weight: 500;
  height: 100%;
  max-width: 50%;
  padding: 0px 15px;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  box-sizing: border-box;
  margin-right: 1px;
  background: #3b3b3b;
  overflow: hidden;
}

.object-text {
  flex: 1;
  display: flex;
  align-items: center;
  color: #c7c7c7;
  font-size: 9.5pt;
  height: 100%;
  padding: 0px 15px;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  box-sizing: border-box;
  background: #3b3b3b;
  overflow: hidden;
}

.object-id p,
.object-text p {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/** === Options Hover === */

.options li {
  opacity: .7; 
}

.options li.active {
  opacity: 1;
}

.options li.active .object-id {
  background: #637bc9;
}

.options li.active.null .object-id {
  background: #404040;
}

.options li.active .object-text {
  background: #404040;
}

/** === No Options === */

.no-options {
  display: flex;
  align-items: center;
  color: #8f8f8f;
  user-select: none;
  height: 45px;
  padding: 0px 15px;
}

</style>
