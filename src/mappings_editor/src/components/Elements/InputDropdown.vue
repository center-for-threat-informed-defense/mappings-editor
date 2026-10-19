<template>
    <div class="input-dropdown">
        <label :for="inputId" class="field-label" v-if="title">
            <small>
                {{ title }}
                <span class="required-or-optional" v-if="required">*</span>
                <span class="required-or-optional" v-else>(optional)</span>
            </small>
        </label>
        <button
            :id="inputId"
            ref="trigger"
            class="dropdown-trigger"
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            :aria-expanded="open"
            :aria-controls="open ? listId : undefined"
            :aria-activedescendant="open && activeIndex >= 0 ? optionId(activeIndex) : undefined"
            :aria-required="required"
            :aria-describedby="localValidationMessage ? messageId : undefined"
            :aria-invalid="Boolean(errorMessage)"
            :disabled="disabled"
            @click="open ? closeMenu() : openMenu()"
            @keydown="onKeyDown"
            @blur="onBlur"
        >
            <span :class="{ placeholder: !selectedOption }">{{ selectedOption?.text ?? placeholder }}</span>
            <span aria-hidden="true" class="dropdown-arrow">▼</span>
        </button>
        <!-- Retain native form submission and required-field validation. -->
        <select
            class="native-select"
            tabindex="-1"
            aria-hidden="true"
            :name="name"
            :value="model ?? ''"
            :required="required"
            :disabled="disabled"
            @invalid.prevent="onInvalid"
        >
            <option value=""></option>
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.text }}
            </option>
        </select>
        <div
            v-if="open"
            ref="menu"
            class="dropdown-menu"
            popover="manual"
            :style="menuStyle"
            @pointerdown.prevent
        >
            <ScrollBox ref="optionsScrollBox" class="options-scroll-box" :propagateScroll="false">
                <ul :id="listId" role="listbox" :aria-labelledby="inputId">
                    <li
                        v-for="(option, index) in options"
                        :id="optionId(index)"
                        :key="option.value"
                        role="option"
                        :aria-selected="option.value === model"
                        :class="{ active: index === activeIndex }"
                        @pointermove="activeIndex = index"
                        @click="selectOption(index)"
                    >{{ option.text }}</li>
                </ul>
                <div v-if="!options.length" class="empty-options">No options available</div>
            </ScrollBox>
        </div>
        <small v-if="localValidationMessage" :id="messageId" class="error-message">
            {{ localValidationMessage }}
        </small>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import ScrollBox from '../Containers/ScrollBox.vue';

/** A single-select dropdown with parent-supplied validation and custom scrolling. */
/** The selected option's value, synchronized with the parent's v-model. */
const model = defineModel<string>();
const props = withDefaults(defineProps<{
    /** Label displayed above the dropdown. Defaults to an empty string. */
    title?: string;
    /** Parent-supplied validation error, displayed after interaction or a failed native validation check. */
    errorMessage?: string;
    /** Requires a nonempty selection and displays a required indicator. Defaults to false. */
    required?: boolean;
    /** Prevents interaction and excludes the field from native form submission. Defaults to false. */
    disabled?: boolean;
    /** Field name used to include the selected value in native form data. */
    name?: string;
    /** Text displayed when no option matches the selected value. Defaults to "Select an option". */
    placeholder?: string;
    /** Options in display order. Values must be unique; an empty value does not satisfy required validation. */
    options: readonly { value: string; text: string }[];
    /** Maximum option-list height in pixels, further limited by available viewport space. Defaults to 240. */
    maxHeight?: number;
}>(), {
    title: '', errorMessage: '', required: false, disabled: false,
    placeholder: 'Select an option', maxHeight: 240,
});

const inputId = useId();
const listId = `${inputId}-options`;
const messageId = `${inputId}-message`;
const trigger = ref<HTMLButtonElement | null>(null);
const menu = ref<HTMLDivElement | null>(null);
const optionsScrollBox = ref<InstanceType<typeof ScrollBox> | null>(null);
const open = ref(false);
const visited = ref(false);
const activeIndex = ref(-1);
const menuStyle = ref<Record<string, string>>({});
const selectedOption = computed(() => props.options.find(option => option.value === model.value));
const localValidationMessage = computed(() => visited.value ? props.errorMessage : '');
const optionId = (index: number) => `${inputId}-option-${index}`;
let search = '';
let lastSearchTime = 0;

async function openMenu(preferLast = false) {
    if (props.disabled || open.value || !trigger.value) return;
    const rect = trigger.value.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 8;
    const above = rect.top - 8;
    const showAbove = below < props.maxHeight && above > below;
    menuStyle.value = {
        left: `${Math.max(4, Math.min(rect.left, window.innerWidth - rect.width - 4))}px`,
        top: `${rect.bottom + 4}px`,
        width: `${Math.min(rect.width, window.innerWidth - 8)}px`,
        '--options-max-height': `${Math.max(0, Math.min(props.maxHeight, (showAbove ? above : below) - 8))}px`,
    };
    const selectedIndex = props.options.findIndex(option => option.value === model.value);
    activeIndex.value = selectedIndex >= 0 ? selectedIndex : preferLast ? props.options.length - 1 : props.options.length ? 0 : -1;
    open.value = true;
    await nextTick();
    if (!open.value || !menu.value) return;
    // A popover stays inside its dialog's focus scope but escapes overflow clipping.
    menu.value.showPopover();
    if (showAbove) menuStyle.value.top = `${Math.max(4, rect.top - menu.value.offsetHeight - 4)}px`;
    optionsScrollBox.value?.scrollbox.refresh();
    revealActiveOption();
}

function closeMenu() {
    menu.value?.hidePopover();
    open.value = false;
    search = '';
}

function selectOption(index: number) {
    const option = props.options[index];
    if (!option) return;
    model.value = option.value;
    visited.value = true;
    closeMenu();
}

function revealActiveOption() {
    const option = document.getElementById(optionId(activeIndex.value));
    const viewport = menu.value?.querySelector('.scroll-content');
    if (!option || !viewport) return;
    const bounds = option.getBoundingClientRect();
    const frame = viewport.getBoundingClientRect();
    if (bounds.top < frame.top) {
        optionsScrollBox.value?.scrollbox.moveScrollPosition(viewport.scrollTop + bounds.top - frame.top);
    } else if (bounds.bottom > frame.bottom) {
        optionsScrollBox.value?.scrollbox.moveScrollPosition(viewport.scrollTop + bounds.bottom - frame.bottom);
    }
}

function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') { closeMenu(); return; }
    if (event.key === 'Escape' && open.value) {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        if (!open.value) { void openMenu(event.key === 'ArrowUp' || event.key === 'End'); return; }
        if (event.key === 'Enter' || event.key === ' ') { selectOption(activeIndex.value); return; }
        if (event.key === 'Home') activeIndex.value = props.options.length ? 0 : -1;
        else if (event.key === 'End') activeIndex.value = props.options.length - 1;
        else activeIndex.value = Math.max(0, Math.min(props.options.length - 1, activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1)));
        void nextTick(revealActiveOption);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const now = Date.now();
        search = now - lastSearchTime > 700 ? event.key : search + event.key;
        lastSearchTime = now;
        const index = props.options.findIndex(option => option.text.toLocaleLowerCase().startsWith(search.toLocaleLowerCase()));
        if (index >= 0) {
            if (open.value) { activeIndex.value = index; void nextTick(revealActiveOption); }
            else { model.value = props.options[index].value; visited.value = true; }
        }
    }
}

function onBlur() { visited.value = true; closeMenu(); }
function onInvalid() { visited.value = true; trigger.value?.focus(); }
function onOutsideInteraction(event: Event) {
    if (open.value && event.target instanceof Node &&
        !trigger.value?.contains(event.target) && !menu.value?.contains(event.target)) closeMenu();
}

watch(() => props.options, () => {
    closeMenu();
    if (!props.options.some(option => option.value === model.value)) {
        model.value = '';
    }
}, { deep: true });
watch(() => props.disabled, disabled => { if (disabled) closeMenu(); });
onMounted(() => {
    document.addEventListener('pointerdown', onOutsideInteraction, true);
    document.addEventListener('wheel', onOutsideInteraction, true);
    document.addEventListener('scroll', onOutsideInteraction, true);
    window.addEventListener('resize', closeMenu);
});
onBeforeUnmount(() => {
    closeMenu();
    document.removeEventListener('pointerdown', onOutsideInteraction, true);
    document.removeEventListener('wheel', onOutsideInteraction, true);
    document.removeEventListener('scroll', onOutsideInteraction, true);
    window.removeEventListener('resize', closeMenu);
});
</script>

<style scoped>
.input-dropdown { position: relative; min-width: 0; }
.field-label { display: block; margin-bottom: 8px; }
.field-label > small { font-size: small; }
.dropdown-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    box-sizing: border-box;
    border: 1px solid var(--me-border-color-strong);
    border-radius: 5px;
    background: var(--me-bg-color-recessed);
    color: var(--me-text-color);
    font: inherit;
    font-size: small;
    text-align: left;
    cursor: pointer;
}
.dropdown-trigger > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dropdown-trigger:focus-visible { outline: 2px solid var(--me-text-color-emphasis); outline-offset: 2px; }
.dropdown-trigger:disabled { opacity: .5; cursor: default; }
.dropdown-arrow { flex-shrink: 0; font-size: .6em; }
.placeholder, .required-or-optional { color: var(--me-text-color-subtle); }
.error-message { color: var(--me-text-color-error); }
.native-select { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.dropdown-menu {
    position: fixed;
    inset: auto;
    margin: 0;
    padding: 4px;
    box-sizing: border-box;
    border: 1px solid var(--me-border-color-strong);
    border-radius: 5px;
    background: var(--me-bg-color-recessed);
    color: var(--me-text-color);
    font: inherit;
    font-size: small;
    box-shadow: 0 4px 12px rgb(0 0 0 / 30%);
}
.options-scroll-box { max-height: var(--options-max-height); flex-basis: auto; }
ul { list-style: none; margin: 0; padding: 0; }
li { padding: 8px; overflow-wrap: anywhere; cursor: pointer; border-radius: 3px; }
li.active { background: var(--me-bg-color-emphasis); color: white; }
li[aria-selected="true"] { font-weight: 600; }
.empty-options { padding: 8px; }
.options-scroll-box :deep(.scroll-handle) { border-radius: 5px; }
</style>
