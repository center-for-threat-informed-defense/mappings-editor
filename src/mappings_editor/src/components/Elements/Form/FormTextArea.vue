<template>
    <div>
        <label>
            <small v-if="title">
                {{ title }}
                <span class="required-or-optional" v-if="required">*</span>
                <span class="required-or-optional" v-else>(optional)</span>
            </small>
            <textarea
                v-model="model"
                :required="required"
                :autocomplete="autocomplete"
                :rows="rows"
                :aria-describedby="localValidationMessage ? messageId : undefined"
                :aria-invalid="isInvalid"
                @blur="visited = true"
                @input="visited = true"
            ></textarea>
        </label>
        <small
            v-if="localValidationMessage"
            :id="messageId"
            class="error-message"
        >
            {{ localValidationMessage }}
        </small>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue';

/** A multiline text input with parent-supplied inline validation. */
const model = defineModel<string>();
const visited = ref(false);
defineExpose({
    /** Mark the field as visited so that validation errors may display. */
    markVisited: () => visited.value = true
});
const messageId = useId();

const props = defineProps({
    title: {
        default: "",
        type: String
    },
    errorMessage: {
        default: "",
        type: String
    },
    required: {
        default: false,
        type: Boolean
    },
    autocomplete: {
        default: "off",
        type: String
    },
    rows: {
        default: 3,
        type: Number
    },
});

// Keep feedback in sync when the parent recomputes validation after an edit.
const localValidationMessage = computed(() => visited.value ? props.errorMessage : '');
const isInvalid = computed(() => Boolean(props.errorMessage));
</script>

<style scoped>
label {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

textarea {
    display: block;
    min-width: 0;
    box-sizing: border-box;
    border: 1px solid var(--me-border-color-strong);
    border-radius: 5px;
    background: var(--me-bg-color-recessed);
    color: var(--me-text-color);
    font: small;
    padding: 10px 12px;
    resize: vertical;
}

.error-message {
    color: var(--me-text-color-error);
}

.required-or-optional {
    color: var(--me-text-color-subtle);
}
</style>
