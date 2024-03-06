<template>
  <div :class="['list-item-options-list-field', { flip }]">
    <div ref="scrollbox" :style="style">
      <div ref="content">
        <ul class="options" v-if="hasOptions">
          <li 
            ref="items"
            v-for="option in options"
            :key="option.value ?? 'null'"
            :list-id="option.value"
            :class="{ active: isActive(option), null: isNull(option) }"
            @pointerdown="$emit('select', option.value)"
            @mouseenter="setActive(option)"
            exit-focus-box
          >
            {{ option.text }}
          </li>
        </ul>
        <div class="no-options" v-else>
          No results found
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { RawScrollBox } from "@/assets/scripts/Utilities";
import { defineComponent, markRaw, type PropType } from "vue";

export default defineComponent({
  name: "OptionsList",
  props: {
    options: {
      type: Array as PropType<{ value: string | null, text: string }[]>,
      required: true
    },
    select: {
      type: String as PropType<string | null>
    },
    maxHeight: {
      type: Number,
      default: 195
    }
  },
  data() {
    return {
      flip: false,
      scrollbox: markRaw(new RawScrollBox(false, false))
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
     * Returns the option list's style.
     * @returns
     *  The option list's style.
     */
    style(): { maxHeight: string } {
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
    isNull(option: Option) {
      return option.value === null
    },

    /**
     * Tests if an option is active.
     * @returns
     *  True if the option is active, false otherwise.
     */
    isActive(option: Option) {
      return this.select === option.value;
    },

    /**
     * Sets the active option.
     * @param option
     *  The option.
     */
    setActive(option: Option) {
      this.$emit("hover", option.value);
    },

    /**
     * Brings an item into focus at the top of the list.
     * @param value
     *  The value to bring into focus.
     */
    focusItemTop(value: string | null) {
      let item = this.getItemElement(value);
      // Update scroll position
      if(item) {
        // -6px for the <ul>'s padding
        this.scrollbox.moveScrollPosition(item.offsetTop - 6)
      }
    },

    /**
     * Brings an item into focus.
     * @param value
     *  The value to bring into focus.
     */
    bringItemIntoFocus(value: string | null) {
      let item = this.getItemElement(value);
      let scrollbox = this.$refs.scrollbox as HTMLElement;
      // Update scroll position
      if(item) {
        let { top: itTop, bottom: itBottom } = item.getBoundingClientRect();
        let { top: elTop, bottom: elBottom } = scrollbox.getBoundingClientRect();
        // -6px for the <ul>'s padding
        if((itTop - 6) < elTop) {
          this.scrollbox.moveScrollPosition(item.offsetTop - 6)
        }
        // -7px for the <ul>'s padding and scrollbox border
        else if(elBottom < (itBottom + 7)) {
          let offsetHeight = (elBottom - elTop) - (itBottom - itTop) - 7;
          this.scrollbox.moveScrollPosition(item.offsetTop - offsetHeight);
        }
      }
    },

    /**
     * Get an item's {@link HTMLElement} from the list.
     * @param value
     *  The value.
     * @returns
     *  The {@link HTMLElement}. `undefined` if the item doesn't exist.
     */
    getItemElement(value: string | null): HTMLElement | undefined {
      let item: HTMLElement | undefined = undefined;
      if(!this.$refs.items) {
        return item;
      }
      for(let el of this.$refs.items as HTMLElement[]) {
        if(value === el.getAttribute("list-id")) {
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
     * If an <ListItemOptionsList> does not extend past the bottom of the
     * document's body or it's parent <ScrollBox>, it's deemed visible. These
     * checks do not account for any other scroll constructs and do not account
     * for nested <ScrollBox>'s. 
     */
    
    // Resolve parent
    let sc = "scroll-content";
    let ele = this.$refs.scrollbox as HTMLElement;
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
    // Configure scrollbox
    this.scrollbox.mount(
      this.$refs.scrollbox as HTMLElement,
      this.$refs.content as HTMLElement,
      this.$options.__scopeId
    )
    // Focus selection
    if(this.select !== undefined) {
      this.focusItemTop(this.select);
    }
  },
  unmounted() {
    this.scrollbox.destroy();
  }
});

/**
 * Option type
 */
 type Option = { 
  value: string | null,
  text: string
}

</script>

<style scoped>

/** === Main Field === */

.list-item-options-list-field {
  background: #1c1c1c;
  border-radius: 3px;
}

.scroll-box {
  position: absolute;
  width: 100%;
  font-size: 10pt;
  border-width: 1px;
  border-color: #3b3b3b;
  box-sizing: border-box;
  background: inherit;
  z-index: 1;
}

.list-item-options-list-field:not(.flip) .scroll-box {
  top: 100%;
  border-style: none solid solid solid;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  box-shadow: 0px 5px 5px -2px rgb(0 0 0 / 20%);
}

.list-item-options-list-field.flip .scroll-box {
  bottom: 100%;
  border-style: solid solid none solid;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  box-shadow: 0px -5px 5px -2px rgb(0 0 0 / 20%);
}

.scroll-bar {
  border-left: solid 1px #333333;
}

/** === Options List === */

.options {
  position: relative;
  padding: 6px 5px;
}

.options li {
  list-style: none;
  color: #b3b3b3;
  user-select: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 5px 12px;
  border-radius: 2px;
  overflow: hidden;
}

/** === Options Hover === */

.options li.active,
.options li.active.null {
  color: #ebebeb;
  background: #637bc9;
}

.options li.null {
  color: #8f8f8f;
}

/** === No Options === */

.no-options {
  display: flex;
  align-items: center;
  color: #8f8f8f;
  user-select: none;
  height: 38px;
  padding: 0px 15px;
}

</style>
