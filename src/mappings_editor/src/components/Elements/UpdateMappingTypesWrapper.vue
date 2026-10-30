<template>
    <fieldset v-for="(type, index) in model" :key="type.key">
        <legend>Mapping Type {{ index + 1 }}</legend>
        <div class="fields">
            <FormTextField
                ref="inputRefs"
                title="Type ID"
                v-model="type.id"
                required
                :error-message="mappingTypesErrors.find(mt => mt.key === type.key)?.id"
            />
            <FormTextField
                ref="inputRefs"
                title="Type Name"
                v-model="type.name"
                required
                :error-message="mappingTypesErrors.find(mt => mt.key === type.key)?.name"
            />
            <FormTextArea
                ref="descriptionRefs"
                class="full-width"
                title="Type Description"
                v-model="type.description"
                required
                :error-message="mappingTypesErrors.find(mt => mt.key === type.key)?.description"
            />
        </div>
        <button class="remove-item" type="button"
            :aria-label="`Remove mapping type ${index + 1}`"
            @click="model.splice(index, 1)">Remove</button>
    </fieldset>
    <button class="add-item" type="button" @click="addItem">Add Mapping Type</button>
</template>
<script lang="ts">
export interface MappingTypeRecord {
    key: string;
    id: string;
    name: string;
    description: string;
}
</script>

<script setup lang="ts">
import { computed, watchEffect, useTemplateRef } from 'vue';
import FormTextField from './Form/FormTextField.vue';
import FormTextArea from './Form/FormTextArea.vue';
import { cleanMappingTypeId } from './MetadataValidation.js';

const model = defineModel<MappingTypeRecord[]>({ required: true });

/** Use this model to detect when the mapping types input is valid. */
const isValid = defineModel('isValid', { default: false, type: Boolean });

const inputRefs = useTemplateRef<InstanceType<typeof FormTextField>[]>('inputRefs');
const descriptionRefs = useTemplateRef<InstanceType<typeof FormTextArea>[]>('descriptionRefs');

defineExpose({
    markAllVisited: () => {
        /** Mark all fields as visited so that validation errors may display. */
        inputRefs.value?.forEach((val) => val.markVisited());
        descriptionRefs.value?.forEach((val) => val.markVisited());
    }
});

function validateName(val: string) {
    if (!val) {
        return "Type name is required.";
    }
    return "";
}

function validateId(val: string): string {
    // Check for existence.
    if (!val) {
        return "Type ID is required.";
    }

    // Check for disallowed characters.
    if (!/^[A-Za-z0-9_ ]+$/.test(val)) {
        return "Use letters, numbers, spaces and underscores only for the ID.";
    }

    // Check for duplicates.
    const cleanedVal = cleanMappingTypeId(val);
    if (model.value.filter(v => cleanMappingTypeId(v.id) === cleanedVal).length > 1) {
        return "Duplicate detected. ID must be unique.";
    }

    return "";
}

function addItem() {
    model.value.push({
        key: crypto.randomUUID(),
        id: '',
        name: '',
        description: ''
    });
}

const mappingTypesErrors = computed(() => {
    const results = [];

    for (const mt of model.value) {

        const typeIdError = validateId(mt.id);
        const typeNameError = validateName(mt.name);
        const typeDescriptionError = mt.description ? "" : "Type description is required.";

        if (typeIdError || typeNameError || typeDescriptionError) {
            results.push({
                id: typeIdError,
                name: typeNameError,
                description: typeDescriptionError,
                key: mt.key
            });
        }
    }

    return results;
});

watchEffect(() => {
    isValid.value = mappingTypesErrors.value.length === 0;
});

</script>
<style scoped>
fieldset {
    min-width: 0;
    margin: 16px 0 0;
    padding: 16px;
    border: 1px solid var(--me-border-color-strong);
    border-radius: 5px;
}

.full-width { grid-column: 1 / -1; }

legend { padding: 0 6px; font-size: small; }

.add-item { margin-top: 12px; }

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

.fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
}

@media (max-width: 520px) {
    .fields { grid-template-columns: minmax(0, 1fr); }
}

.remove-item { margin-top: 12px; }
</style>
