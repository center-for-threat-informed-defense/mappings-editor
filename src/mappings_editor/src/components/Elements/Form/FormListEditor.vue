<template>
    <fieldset v-for="(item, index) in model" :key="item.key">
        <legend>{{ itemLabel }} {{ index + 1 }}</legend>
        <div class="fields">
            <component
                v-for="field in fields"
                :key="field.key"
                :is="field.multiline ? FormTextArea : FormTextField"
                ref="inputRefs"
                :class="{ 'full-width': field.multiline }"
                :title="field.label"
                :model-value="getFieldValue(item, field.key)"
                :required="field.required !== false"
                :error-message="errors.get(item.key)?.[field.key]"
                @update:model-value="setFieldValue(item, field.key, $event)"
            />
        </div>
        <button
            class="remove-item"
            type="button"
            :aria-label="`Remove ${itemLabel.toLowerCase()} ${index + 1}`"
            @click="model.splice(index, 1)"
        >Remove</button>
    </fieldset>
    <button class="add-item" type="button" @click="addItem">Add {{ itemLabel }}</button>
</template>

<script lang="ts">
export interface FormListField<T extends { key: string }> {
    /** Row property to edit. The stable row key is reserved. */
    key: Exclude<keyof T & string, 'key'>;
    label: string;
    /** Render a textarea spanning both columns. */
    multiline?: boolean;
    /** Fields are required unless explicitly set to false. */
    required?: boolean;
    /** Runs after the required check. Return an error message, or an empty string when valid. */
    validate?: (value: string, row: T, rows: readonly T[]) => string;
}
</script>

<script setup lang="ts" generic="T extends { key: string }">
import { computed, useTemplateRef, watchEffect } from 'vue';
import FormTextField from './FormTextField.vue';
import FormTextArea from './FormTextArea.vue';

/** Rows contain a stable key and string values for the configured fields. */
const model = defineModel<T[]>({ required: true });
const isValid = defineModel('isValid', { default: false, type: Boolean });

const props = defineProps<{
    /** Singular name used in row legends and Add/Remove controls. */
    itemLabel: string;
    fields: readonly FormListField<T>[];
}>();

const inputRefs = useTemplateRef<{ markVisited(): void }[]>('inputRefs');

defineExpose({
    /** Show validation feedback on all currently rendered fields. */
    markAllVisited: () => {
        inputRefs.value?.forEach(input => input.markVisited());
    },
});

function getFieldValue(item: T, key: FormListField<T>['key']): string {
    return String(item[key] ?? '');
}

function setFieldValue(item: T, key: FormListField<T>['key'], value: string): void {
    item[key] = value as T[typeof key];
}

function addItem(): void {
    model.value.push({
        ...Object.fromEntries(props.fields.map(field => [field.key, ''])),
        key: crypto.randomUUID(),
    } as T);
}

function validateField(item: T, field: FormListField<T>): string {
    const value = getFieldValue(item, field.key);
    if (field.required !== false && !value.trim()) {
        return `${field.label} is required.`;
    }

    return field.validate?.(value, item, model.value) ?? '';
}

const errors = computed(() => {
    const result = new Map<string, Record<string, string>>();
    for (const item of model.value) {
        const fieldErrors: Record<string, string> = {};
        for (const field of props.fields) {
            const error = validateField(item, field);
            if (error) {
                fieldErrors[field.key] = error;
            }
        }
        if (Object.keys(fieldErrors).length > 0) {
            result.set(item.key, fieldErrors);
        }
    }
    return result;
});

watchEffect(() => {
    isValid.value = errors.value.size === 0;
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

legend { padding: 0 6px; font-size: small; }

.fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
}

.full-width { grid-column: 1 / -1; }
.add-item, .remove-item { margin-top: 12px; }

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

@media (max-width: 520px) {
    .fields { grid-template-columns: minmax(0, 1fr); }
}
</style>
