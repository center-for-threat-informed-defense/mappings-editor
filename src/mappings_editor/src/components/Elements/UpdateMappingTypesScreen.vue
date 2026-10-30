<template>
    <AppModal
        class="modal-root"
        title="Edit Mapping Types"
        description="Add new mapping types, update existing types, or delete types."
        @close="onCancel"
    >
        <form
            class="modal-body"
            @submit.prevent="onSubmit"
        >
            <FormListEditor
                ref="listEditor"
                v-model="mappingTypes"
                v-model:is-valid="isValid"
                item-label="Mapping Type"
                :fields="mappingTypeFields"
            />
            <div class="modal-buttons">
                <button type="button" @click="onCancel">Cancel</button>
                <button type="submit" :disabled="!isValid">Confirm</button>
            </div>
        </form>
    </AppModal>
</template>

<script setup lang="ts">
import AppModal from './AppModal.vue';
import FormListEditor from './Form/FormListEditor.vue';
import { mappingTypeFields } from './MappingTypeFields';
import { ref, onMounted, useTemplateRef } from 'vue';
import { useApplicationStore } from '@/stores/ApplicationStore.js';
import { nextTick } from 'vue';
import type { EditMappingTypeRecord } from '@/assets/scripts/MappingFileEditor/EditorCommands/File/EditMappingTypes';

// Generic components expose their instance through the third argument's callback.
type FormListEditorInstance = Parameters<NonNullable<Parameters<typeof FormListEditor>[2]>>[0];
const listEditor = useTemplateRef<FormListEditorInstance>('listEditor');

const app = useApplicationStore();

const mappingTypes = ref<EditMappingTypeRecord[]>([]);

const isValid = ref(false);

const emit = defineEmits(['close']);

function initializeMappingTypes(): EditMappingTypeRecord[] {
    return [...app.activeEditor.file.mappingTypes.value.values()].map(item => ({
        key: item.id,
        id: item.getAsString("id"),
        name: item.getAsString("name"),
        description: item.getAsString("description"),
    }));
}

function onCancel() {
    if (app.showEditMappingTypes) {
        app.answerEditMappingTypes(null);
    }
    emit('close');
}

function onSubmit() {
    if (!isValid.value) {
        return;
    }
    app.answerEditMappingTypes(mappingTypes.value.map(type => ({ ...type })));
}

onMounted(async () => {
    mappingTypes.value = initializeMappingTypes();
    await nextTick();
    listEditor.value?.markAllVisited();
});

</script>

<style scoped>
button {
    padding: 10px 18px;
    border: 1px solid var(--me-border-color-strong);
    border-radius: 5px;
    background: var(--me-bg-color-recessed);
    color: var(--me-text-color);
    font: inherit;
    cursor: pointer;
}
button:hover {
    background-color: var(--me-bg-color-recessed-hover);
    color: var(--me-text-color-strong);
}
button[type="submit"] {
    background: var(--me-bg-color-emphasis);
    color: var(--me-text-color-strong);
}
button[type="submit"]:hover {
    background: var(--me-bg-color-emphasis-hover);
}
button[type="submit"]:disabled {
    cursor: not-allowed;
    background: var(--me-bg-color-emphasis-disabled );
    color: lightgrey;
}

.modal-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    justify-content: end;
}
</style>
