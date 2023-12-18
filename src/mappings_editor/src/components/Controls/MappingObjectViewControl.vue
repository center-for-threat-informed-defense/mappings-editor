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
        class="source-object bright"
        :is="getPropertyField(view.object.mappingType)"
        :property="view.object.mappingType"
        @execute="alterProperty"
      />
      <div class="mapping-arrow"><MappingArrow/></div>
      <component
        class="target-object bright"
        :is="getPropertyField(view.object.targetObject)"
        :property="view.object.targetObject"
        @execute="alterProperty"
      />
      <div class="trash-mapping" @click="deleteView()">
        <TrashCan />
      </div>
    </div>
    <div class="mapping-object-body" v-if="!view.collapsed">
      <div class="research-section">
        <template v-for="{ key, type, prop } of properties" :key="key">
          <div :class="['property', key]">
            <p class="property-name">{{ prop.name }}</p>
            <component 
              class="property-value"
              :is="type"
              :property="prop"
              placeholder="None"
              @execute="alterProperty"
            />
          </div>
        </template>
        <div class="property references">
          <p class="property-name">References</p>
          <ListField
            class="property-value"
            :property="view.object.references"
            placeholder="None"
            @execute="alterProperty"
            v-slot="{ item }"
          >
            <a :href="toAbsoluteUrl(item.getAsString('url'))" target="_blank" >
              {{ toAbsoluteUrl(item.getAsString("url")) || "None" }}
            </a>
          </ListField>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

/**
 * This file is a mess. I will fix it.
 */

// Dependencies
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands";
import { defineComponent, type PropType } from 'vue';
import { 
  DynamicFrameworkObjectProperty,
  ListItemProperty, Property,
  StrictFrameworkObjectProperty, StringProperty
} from "@/assets/scripts/MappingFile";
import type { EditorCommand, MappingObjectView } from "@/assets/scripts/MappingFileEditor";
// Components
import TrashCan from "../Icons/TrashCan.vue";
import TextField from "./Fields/TextField.vue";
import ListField from "./Fields/ListField.vue";
import MappingArrow from "../Icons/MappingArrow.vue";
import ListItemField from "./Fields/ListItemField.vue";
import TextAreaField from "./Fields/TextAreaField.vue";
import CollapseArrowLarge from '../Icons/CollapseArrowLarge.vue';
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
  computed: {
    
    /**
     * Returns the object view's editable properties.
     * @returns
     *  The object view's editable properties.
     */
    properties(): { key: string, prop: Property, type: string }[] {
      let object = this.view.object;
      return [
        // {
        //   key: "author-name",
        //   prop: object.author,
        //   type: this.getPropertyField(object.author)
        // },
        // {
        //   key: "author-contact",
        //   prop: object.authorContact,
        //   type: this.getPropertyField(object.author)
        // },
        // { 
        //   key: "author-organization",
        //   prop: object.authorOrganization,
        //   type: this.getPropertyField(object.authorOrganization)
        // },
        { 
          key: "comments",
          prop: object.comments,
          type: "TextAreaField"
        },
        {
          key: "score-category",
          prop: object.scoreCategory,
          type: this.getPropertyField(object.scoreCategory)
        },
        {
          key: "score-value",
          prop: object.scoreValue,
          type: this.getPropertyField(object.scoreValue)
        },
        { 
          key: "mapping-group",
          prop: object.mappingGroup,
          type: this.getPropertyField(object.mappingGroup)
        },
        {
          key: "mapping-status",
          prop: object.mappingStatus,
          type: this.getPropertyField(object.mappingStatus)
        },
      ]
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
      } else if(prop instanceof StringProperty) {
        return "TextField"
      } else {
        throw new Error(`Cannot render field type '${ 
          prop.constructor.name
        }'.`)
      }
    },

    /**
     * Converts a url to an absolute url. 
     * @param url
     *  The url to convert.
     * @returns
     *  The absolute url.
     */
    toAbsoluteUrl(url: string): string | undefined {
      if(url === "") {
        return undefined;
      }
      // If already absolute url...
      if(/^(?:[a-z+]+:)?\/\//i.test(url)) {
        // ...return as is
        return url;
      } 
      // If relative url...
      else {
        // ...pre-append https://
        return `https://${ url }`
      }
    }

  },
  components: { 
    TrashCan, TextField, MappingArrow, CollapseArrowLarge, ListItemField,
    TextAreaField, StrictFrameworkObjectField, DynamicFrameworkObjectField,
    ListField
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
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 36px 225px 36px minmax(0, 1fr) 43px;
  align-items: center;
  color: #c7c7c7;
  height: 40px;
  z-index: 1;
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
  flex: 1 1 0;
  background: #242424;
  min-height: 0px;
  padding: 0px 11px;
  border-top: solid 1px #3b3b3b;
  background-image: url("@/assets/images/dot_texture.png");
  background-size: 4px 4px;
  border-bottom-left-radius: 4px;
}

.research-section {
  display: grid;
  row-gap: 15px;
  column-gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  padding: 25px 29px;
  box-sizing: border-box;
  background: #242424;
}

/** === Mapping Object Body Properties === */

.property {
  display: flex;
  flex-direction: column;
}

.property-value {
  width: 100%;
}

.property .property-name {
  color: #909090;
  margin-left: 2px;
  margin-bottom: 8px;
}

.author-name {
  grid-area: 1 / 1;
}

.author-contact {
  grid-area: 1 / 2;
}

.author-organization {
  grid-area: 1 / 3;
}

.comments {
  grid-area: 2 / 1 / 3 / 3;
}

.comments .property-value {
  flex: 1;
}

.references { 
  grid-area: 2 / 3 / 3 / 5;
}

.references .property-value {
  flex: 1;
  background: none;
}

.score-category {
  grid-area: 1 / 3;
}

.score-value {
  grid-area: 1 / 4;
}

.related-score {
  grid-area: 2 / 3 / 2 / 5;
}

.mapping-group {
  grid-area: 1 / 1;
}

.mapping-status {
  grid-area: 1 / 2;
}

a {
  display: inline-block;
  color: #999;
  word-break: break-all;
  user-select: none;
  padding: 8px 10px;
}

a[href] {
  color: #89a0ec;
  text-decoration: underline;
  user-select: initial;
}

</style>
