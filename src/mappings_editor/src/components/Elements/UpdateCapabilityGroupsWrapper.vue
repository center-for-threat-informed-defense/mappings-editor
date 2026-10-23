<template>
    <button class="add-item" type="button" @click="addItem">Add Capability Group</button>
    <fieldset v-for="(group, index) in model" :key="group.key">
        <legend>Capability Group {{ index + 1 }}</legend>
        <div class="fields">
            <FormTextField
                title="Group ID"
                v-model="group.id"
                required
                :error-message="capabilityGroupsErrors.find(cg => cg.key === group.key)?.id"
            />
            <FormTextField
                title="Group Name"
                v-model="group.name"
                required
                :error-message="capabilityGroupsErrors.find(cg => cg.key === group.key)?.name"
            />
        </div>
        <button class="remove-item" type="button"
            :aria-label="`Remove capability group ${index + 1}`"
            @click="model.splice(index, 1)">Remove</button>
    </fieldset>
</template>
<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import FormTextField from './Form/FormTextField.vue';
import { cleanCapabilityGroupId } from './MetadataValidation.js';

const model = defineModel<{ key: number, id: string, name: string }[]>({ default: [] });
const isValid = defineModel('isValid', { default: false, type: Boolean });

function validateName(val: string) {
    if (!val) {
        return "Group name is required.";
    }
    return "";
}

function validateId(val: string): string {
    // Check for existence.
    if (!val) {
        return "Group ID is required.";
    }

    // Check for disallowed characters.
    if (!/^[A-Za-z0-9_ ]+$/.test(val)) {
        return "Use letters, numbers, spaces and underscores only for the ID.";
    }

    // Check for duplicates.
    const cleanedVal = cleanCapabilityGroupId(val);
    if (model.value.filter(v => cleanCapabilityGroupId(v.id) === cleanedVal).length > 1) {
        return "Duplicate detected. ID must be unique.";
    }

    return "";
}

function addItem() {
    const currentMaxKey = model.value.toSorted((a, b) => {
        return a.key - b.key;
    })?.[0]?.key ?? 0;

    const nextKey = currentMaxKey + 1;

    model.value.push({
        key: nextKey,
        id: '',
        name: ''
    });
}

const capabilityGroupsErrors = computed(() => {
    const results = [];

    for (const cg of model.value) {

        const groupIdError = validateId(cg.id);
        const groupNameError = validateName(cg.name);

        if (groupIdError || groupNameError) {
            results.push({
                id: groupIdError,
                name: groupNameError,
                key: cg.key
            });
        }
    }

    return results;
});

watchEffect(() => {
    isValid.value = capabilityGroupsErrors.value.length === 0;
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