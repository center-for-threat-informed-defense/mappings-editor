<template>
    <div class="button-pane">
        <button v-for="option in options" :key="option.id" @click="application.setActiveSidebar(option)"
            :class="['menu-button', { active: option === activeSection }]">
            <component :is="option.icon" :view="option.icon" color="#FFFFFF"/>
            <p class="tooltip-text">{{ option.label }}</p>
        </button>
    </div>
</template>

<script lang="ts">
import MoveDots from "../Icons/MoveDots.vue";
import AlertIcon from "../Icons/AlertIcon.vue";
import ListMappings from "../Icons/ListMappings.vue";
import { defineComponent } from "vue";
import { useApplicationStore } from "../../stores/ApplicationStore";

export default defineComponent({
    name: "ActiveViewSidebar",
    data() {
        return {
            application: useApplicationStore()
        }
    },
    computed: {
        /**
         * Returns the editor's sidebar view options, used to populate the view menu
         * @returns
         *  The editor's options for how to view information in the sidebar
         */
        options() {
            return this.application.sidebarViewOptions;
        },
        /**
         * Returns the pane actively being displayed in the sidebar
         * @returns
         * The currently active sidebar element
         */
        activeSection() {
            return this.application.activeSidebar;
        }
    },
    components: {
        MoveDots, AlertIcon, ListMappings
    }
})
</script>

<style scoped>
.button-pane {
    width: 50px;
    box-sizing: border-box;
    border-right: solid 1px #333333;
}

.menu-button {
    padding: 10px;
    width: 50px;
    height: 50px;
    text-align: center;
    border-radius: 3px;
    box-sizing: border-box;
    border: solid 1px #333333;
    background: #242424;
    cursor: pointer;
}
.menu-button svg {
    width: 16px;
    height: 16px;
}

.menu-button.active {
    background-color: #637bc9;
}

.tooltip-text {
    visibility: hidden;
    border: solid 1px #333333;
    background: #242424;
    color: white;
    padding: 8px 12px;
    border-radius: 10px;
    max-width: 200px;
    left: 50px;
    z-index: 1000000;
    position: absolute;
    text-align: left;
    margin-top: -20px;
}

.menu-button:hover .tooltip-text {
    visibility: visible;
}
</style>
