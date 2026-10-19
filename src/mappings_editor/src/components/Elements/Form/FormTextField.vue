<template>
    <div>
        <label>
            <small v-if="title">
                {{ title }}
                <span class="required-or-optional" v-if="required">*</span>
                <span class="required-or-optional" v-else>(optional)</span>
            </small>
            <input
                type="text"
                v-model="model"
                :required="required"
                :autocomplete="autocomplete"
                :aria-describedby="localValidationMessage ? messageId : undefined"
                :aria-invalid="isInvalid"
                @blur="checkValidation"
                @input="checkValidation"
            />
        </label>
        <small
            v-if="localValidationMessage"
            :id="messageId"
            :class="`error-message`"
        >
            {{ localValidationMessage}}
        </small>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, useId } from 'vue';

/**
 * A text input with inline validation.
 */

const model = defineModel();

/** Validation message to show after the input has been visited. */ 
const localValidationMessage = ref('');
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
});

const isInvalid = computed(() => Boolean(
    localValidationMessage.value || props.errorMessage
));

function checkValidation() {
    // If an error message is present, that takes precedence.
    if (props.errorMessage) {
        localValidationMessage.value = props.errorMessage;
        return;
    } else {
        localValidationMessage.value = "";
    }
}

</script>
<style scoped>
label {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

input {
    display: block;
    border: 1px solid var(--me-border-color-strong);
    border-radius: 5px;
    background: var(--me-bg-color-recessed);
    padding: 10px 12px;
}

.error-message {
    color: var(--me-text-color-error);
}

.required-or-optional {
    color: var(--me-text-color-subtle);
}
</style>
