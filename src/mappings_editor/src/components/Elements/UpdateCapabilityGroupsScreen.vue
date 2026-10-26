<template>
    <AppModal
        title="Edit Capability Groups",
        description="Add new capability groups, update existing groups, or delete groups."
        @close="emit('close')"
    >
        <form
            class="modal-body"
            @submit.prevent="onSubmit"
        >
            <UpdateCapabilityGroupsWrapper v-model="capabilityGroups"/>
            <div class="modal-buttons">
                <button type="button" @click="emit('close')">Cancel</button>
                <button type="submit">Confirm</button>
            </div>
        </form>
    </AppModal>
</template>
<script setup lang="ts">
import AppModal from './AppModal.vue';
import UpdateCapabilityGroupsWrapper from './UpdateCapabilityGroupsWrapper.vue';
import { ref } from 'vue';

const capabilityGroups = ref([]);

const emit = defineEmits(['close']);

function onSubmit() {

}

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