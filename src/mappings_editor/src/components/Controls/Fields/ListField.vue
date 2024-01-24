<template>
  <div class="list-field">
    <div class="new-item-container">
      <div class="new-item-fields">
        <component
          class="property"
          v-for="[key, prop] of newItem.properties" :key="key"
          :is="getPropertyField(prop)"
          :property="prop"
          :placeholder="prop.name"
          @execute="setProperty"
        />
      </div>
      <div class="add-item" @click="addItem">
        <PlusLarge />
      </div>
    </div>
    <div class="list-items-container" ref="scrollbox">
      <div class="list-items" ref="content">
        <div class="list-item" v-for="[key, item] of property.value" :key="key">
          <div class="list-item-content">
            <slot :item="item">{{ item.id }}</slot>
          </div>
          <div class="delete-item" @click="deleteItem(item)">✗</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { defineComponent, markRaw, type PropType } from 'vue';
import { 
  DynamicFrameworkObjectProperty,
  ListItem, ListItemProperty, ListProperty, Property,
  StrictFrameworkObjectProperty, StringProperty
} from "@/assets/scripts/MappingFile";
import { RawScrollBox } from "@/assets/scripts/Utilities";
import type { EditorCommand } from "@/assets/scripts/MappingFileEditor";
// Components
import PlusLarge from "@/components/Icons/PlusLarge.vue";
import TextField from "./TextField.vue";
import ListItemField from "./ListItemField.vue";
import TextAreaField from "./TextAreaField.vue";
import StrictFrameworkObjectField from "./StrictFrameworkObjectField.vue";
import DynamicFrameworkObjectField from "./DynamicFrameworkObjectField.vue";

export default defineComponent({
  name: 'MappingObjectViewControl',
  props: {
    property: {
      type: Object as PropType<ListProperty>,
      required: true
    },
    placeholder: {
      type: String,
      default: "-"
    }
  },
  data() {
    return {
      newItem: this.property.createNewItem(),
      scrollbox: markRaw(new RawScrollBox(false, false))
    }
  },
  computed: {

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
     * Sets a property's value.
     * @param command
     *  A command that alter's a property.
     */
    setProperty(command: EditorCommand) {
      command.execute();
    },

    /**
     * List item add behavior.
     */
    addItem() {
      if(!this.newItem.isUnset()) {
        this.execute(EditorCommands.addItemToListProperty(this.property, this.newItem, 0));
        this.newItem = this.property.createNewItem();
      }
    },

    /**
     * List item delete behavior.
     * @param item
     *  The list item to delete.
     */
    deleteItem(item: ListItem) {
      this.execute(EditorCommands.deleteItemFromListProperty(this.property, item));
    },

    /**
     * Returns a property's field type.
     * @param view
     *  The {@link Property}.
     * @returns
     *  The property's field type.
     */
    getPropertyField(prop: Property): string {
      if(prop instanceof StrictFrameworkObjectProperty) {
        return "StrictFrameworkObjectField";
      } else if(prop instanceof DynamicFrameworkObjectProperty) {
        return "DynamicFrameworkObjectField";
      } else if(prop instanceof ListItemProperty) {
        return "ListItemField"
      } else if(prop instanceof StringProperty) {
        return "TextField"
      } else {
        throw new Error(`Cannot render field type '${ 
          prop.constructor.name
        }'.`)
      }
    },

  },
  mounted() {
    this.scrollbox.mount(
      this.$refs.scrollbox as HTMLElement,
      this.$refs.content as HTMLElement,
      this.$options.__scopeId
    )
  },
  unmounted() {
    this.scrollbox.destroy();
  },
  components: { 
    PlusLarge, TextField, ListItemField, TextAreaField,
    StrictFrameworkObjectField, DynamicFrameworkObjectField
  }
});
</script>

<style scoped>

/** === Main Control === */

.list-field {
  display: flex;
  flex-direction: column;
  color: #b8b8b8;
  font-size: 10pt;
  font-weight: 500;
  box-sizing: border-box;
  overflow: hidden;
}

/** === New Item === */

.new-item-container {
  display: flex;
  margin-bottom: 6px;
}

.new-item-fields {
  flex: 1;
  display: flex;
}

.property {
  flex: 1;
  margin-right: 6px;
}

.add-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  width: 30px;
  height: 100%;
  border: solid 1px #3b3b3b;
  border-radius: 3px;
  box-sizing: border-box;
  background: #303030;
  cursor: pointer;
}

.add-item:hover svg {
  fill: #b3b3b3 !important;
}

/** === List Items === */

.list-items-container {
  flex: 1;
  border: solid 1px #3b3b3b;
  border-radius: 3px;
  box-sizing: border-box;
}

.list-items-container .scroll-bar {
  border-left: solid 1px #3b3b3b;
}

.list-items {
  padding: 2px;
}

.list-item {
  display: flex;
  align-items: stretch;
  width: 100%;
  border-radius: 3px;
  margin-bottom: 2px;
  background: #303030;
}

.list-item:last-child {
  margin-bottom: 0px;
}

.list-item-content {
  flex: 1;
}

.delete-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #808080;
  font-size: 12pt;
  user-select: none;
  width: 31px;
  cursor: pointer;
}

.delete-item:hover {
  color: #b3b3b3;
}

</style>
