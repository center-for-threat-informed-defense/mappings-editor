<template>
    <dialog
        ref="dialog"
        @keydown.stop
        @keyup.stop
        @close="emit('close')"
    >
        <header>
            <slot name="header">
                <h1>{{ title }}</h1>
                <p>{{ description }}</p>
            </slot>
        </header>
        <ScrollBox class="scroll-box">
            <div class="modal-body">
                <slot></slot>
            </div>
        </ScrollBox>
    </dialog>
</template>
<script setup lang="ts">
/**
 * Generic modal component.
 */
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import ScrollBox from '../Containers/ScrollBox.vue';

const dialog = useTemplateRef<HTMLDialogElement>('dialog');

onMounted(() => {
    dialog.value?.showModal();
});

onBeforeUnmount(() => {
    dialog.value?.close();
});

const props = defineProps({
    title: {
        default: 'Title',
        type: String
    },
    description: {
        default: 'Description',
        type: String
    }
});

const emit = defineEmits(['close']);
</script>
<style scoped>
dialog::backdrop {
    background: rgb(0 0 0 / 30%);
    backdrop-filter: blur(5px);
}

dialog {
    background-color: var(--me-bg-color-recessed);
    color: var(--me-text-color);
    border: 1px solid var(--me-border-color-subtle);
    border-radius: 10px;
    padding: 0;
    width: 640px;
    overflow: hidden;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
}

.scroll-box {
    flex: 0 1 auto;
    min-height: 0;
}

header {
    flex-shrink: 0;
    padding: 24px 30px;
    border-bottom: 1px solid var(--me-border-color-subtle);
}

header h1 {
    margin: 0 0 8px;
    font-size: large;
    color: var(--me-text-color-emphasis);
}

header p { margin: 0; font-size: small; }

.modal-body {
    padding: 24px 24px;
}
</style>