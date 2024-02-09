<template>
  <div class="mapping-object-view-control">
    <div class="mapping-object-header">
      <div class="collapse-icon" :class="{ collapsed: view.collapsed }" @click="toggleViewCollapse">
        <svg width="11.314" height="7.0711"  viewBox="0 0 2.9934 1.8709">
          <g transform="translate(-.49321 -1.3794)">
            <path
              d="m1.9899 3.2503 1.4967-1.4967-0.37418-0.37418-1.1225 
              1.1225-1.1225-1.1225-0.37418 0.37418 1.1225 1.1225z"
            />
          </g>
        </svg>
      </div>
      <component
        class="source-object"
        :is="getPropertyField(view.object.sourceObject)"
        :property="view.object.sourceObject"
        @execute="alterProperty"
      />
      <div class="mapping-arrow">
        <img src="@/components/Icons/MappingArrow.svg"/>
      </div>
      <component
        class="source-object bright"
        :is="getPropertyField(view.object.mappingType)"
        :property="view.object.mappingType"
        @execute="alterProperty"
      />
      <div class="mapping-arrow">
        <img src="@/components/Icons/MappingArrow.svg"/>
      </div>
      <component
        class="target-object bright"
        :is="getPropertyField(view.object.targetObject)"
        :property="view.object.targetObject"
        @execute="alterProperty"
      />
      <div class="move-mapping" move-handle>
        <svg width="10" height="7" viewBox="0 0 2.6458 1.8521">
          <path
            d="m0 0v0.52917h0.52917v-0.52917zm1.0583 0v0.52917h0.52917v-0.52917z
            m1.0583 0v0.52917h0.52917v-0.52917zm-2.1167 1.3229v0.52917h0.52917
            v-0.52917zm1.0583 0v0.52917h0.52917v-0.52917zm1.0583 0v0.52917
            h0.52917v-0.52917z"
          />
        </svg>
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
              {{ item.getAsString("url") || "None" }}
            </a>
          </ListField>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

/**
 * Developer's Note:
 * SVGs are directly embedded in this component to improve render performance.
 * Currently, Vue has no way to directly import SVGs without wrapping them in a
 * component.
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
import TextField from "./Fields/TextField.vue";
import ListField from "./Fields/ListField.vue";
import ListItemField from "./Fields/ListItemField.vue";
import TextAreaField from "./Fields/TextAreaField.vue";
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
          key: "capability-group",
          prop: object.capabilityGroup,
          type: this.getPropertyField(object.capabilityGroup)
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
      this.execute(EditorCommands.setMappingObjectViewProperty(this.view, command));
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
    TextField, ListItemField, ListField, TextAreaField,
    StrictFrameworkObjectField, DynamicFrameworkObjectField,
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

/** === Mapping Object Header === */

.mapping-object-header {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 36px 15.5% 36px minmax(0, 1fr) 40px;
  align-items: center;
  color: #c7c7c7;
  height: 40px;
}

.source-object,
.target-object,
.mapping-type {
  height: 28px;
}

.collapse-icon,
.mapping-arrow,
.move-mapping,
.trash-mapping {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  user-select: none;
}

.collapse-icon,
.trash-mapping {
  cursor: pointer;
}

.move-mapping {
  cursor: grab;
}

.collapse-icon svg,
.mapping-arrow svg,
.move-mapping svg,
.trash-mapping svg {
  display: block;
  pointer-events: none;
}

.collapse-icon svg {
  fill: #8c8c8c
}

.collapse-icon.collapsed svg { 
  transform: rotate(270deg);
}

.move-mapping svg {
  fill: #737373;
}

.collapse-icon:hover svg,
.move-mapping:hover svg,
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

.capability-group {
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
