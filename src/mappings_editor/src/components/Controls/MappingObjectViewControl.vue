<template>
  <div :class="['mapping-object-view-control', { selected: view.selected }]">
    <div class="mapping-object-header">
      <div class="collapse-icon" @click="toggleViewCollapse">
        <CollapseArrowLarge :collapsed="view.collapsed" />
      </div>
      <component
        class="source-object"
        :is="getPropertyField(view.object.sourceObject)"
        :property="view.object.sourceObject"
        @execute="alterProperty"
      />
      <div class="mapping-arrow"><MappingArrow/></div>
      <component
        class="source-object"
        :is="getPropertyField(view.object.mappingType)"
        :property="view.object.mappingType"
        @execute="alterProperty"
      />
      <div class="mapping-arrow"><MappingArrow/></div>
      <component
        class="target-object"
        :is="getPropertyField(view.object.targetObject)"
        :property="view.object.targetObject"
        @execute="alterProperty"
      />
      <div class="trash-mapping" @click="deleteView()">
        <TrashCan />
      </div>
    </div>
    <div class="mapping-object-body" v-if="!view.collapsed">

    </div>
  </div>
</template>

<script lang="ts">
// Dependencies
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { defineComponent, type PropType } from 'vue';
import { DynamicFrameworkObjectProperty, ListItemProperty, Property, StrictFrameworkObjectProperty } from "@/assets/scripts/MappingFile";
import type { EditorCommand, MappingObjectView } from "@/assets/scripts/MappingFileEditor";
// Components
import TrashCan from "@/components/Icons/TrashCan.vue";
import MappingArrow from "@/components/Icons/MappingArrow.vue";
import CollapseArrowLarge from '../Icons/CollapseArrowLarge.vue';
import ListItemField from "./Fields/ListItemField.vue";
import StrictFrameworkObjectField from "./Fields/StrictFrameworkObjectField.vue";
import DynamicFrameworkObjectField from "./Fields/DynamicFrameworkObjectField.vue";

export default defineComponent({
  name: 'MappingObjectViewControl',
  props: {
      view: {
        type: Object as PropType<MappingObjectView>,
        required: true
      }
  },
  data() {
      return {
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
     * Alters a view's property.
     * @param command
     *  The command that alter's a property.
     */
    alterProperty(command: EditorCommand) {
      this.execute(EditorCommands.alterMappingObjectViewProperty(this.view, command));
    },

    /**
     * Deletes the view.
     */
    deleteView() {
      this.execute(EditorCommands.deleteMappingObjectView(this.view));
    },

    /**
     * Toggles the view's collapsed state.
     */
    toggleViewCollapse() {
      let cmd;
      if(this.view.collapsed) {
        cmd = EditorCommands.uncollapseViewItem(this.view);
      } else {
        cmd = EditorCommands.collapseViewItem(this.view);
      }
      this.$emit("execute", cmd);
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
      } else {
        throw new Error(`Cannot render field type '${ 
          prop.constructor.name
        }'.`)
      }
    },

  },
  components: { 
    TrashCan, MappingArrow, CollapseArrowLarge, ListItemField,
    StrictFrameworkObjectField, DynamicFrameworkObjectField
  }
});
</script>

<style scoped>

/** === Main Control === */

.mapping-object-view-control {
  display: flex;
  flex-direction: column;
  color: #b8b8b8;
  font-size: 10pt;
  font-weight: 500;
  border-style: solid none solid solid;
  border-width: 1px;
  border-color: #3b3b3b;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  box-sizing: border-box;
  background: #292929;
}

.mapping-object-view-control.selected {
  border-color: #637bc9;
}

/** === Mapping Object Header === */

.mapping-object-header {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 36px 225px 36px minmax(0, 1fr) 43px;
  align-items: center;
  height: 40px;
}

.source-object,
.target-object,
.mapping-type {
  height: 28px;
}

.collapse-icon,
.mapping-arrow,
.trash-mapping {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  user-select: none;
}

.collapse-icon svg,
.mapping-arrow svg,
.trash-mapping svg {
  display: block;
}

.collapse-icon,
.trash-mapping {
  cursor: pointer;
}

.collapse-icon:hover svg,
.trash-mapping:hover svg {
  fill: #b3b3b3 !important;
}

/** === Mapping Object Body === */

.mapping-object-body {
  flex: 1;
  border-top: solid 1px #3b3b3b;
}

</style>
