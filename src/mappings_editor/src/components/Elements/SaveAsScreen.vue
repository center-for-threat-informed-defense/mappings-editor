<template>
    <dialog
        ref="dialog"
        @keydown.stop
        @keyup.stop
    >
        <header>
            <h1>Save As</h1>
            <small>
                Enter a new name for this file, then save it.
            </small>
        </header>
        <form @submit.prevent="onFormSubmit">
            <div>
                <label>
                    Filename
                    <input
                        v-model="fileName"
                        type="text"
                        required
                    />
                </label>
            </div>

            <div>
                <button type="button" @click="onClickCancel">Cancel</button>
                <button type="submit">Save</button>
            </div>
        </form>
    </dialog>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef, ref } from 'vue';
import { useApplicationStore } from '@/stores/ApplicationStore';

const app = useApplicationStore();

const dialog = useTemplateRef('dialog');

const fileName = ref('');

function onClickCancel() {
    app.answerSaveAsName(null);
}

function onFormSubmit() {
    app.answerSaveAsName(fileName.value);
}

onMounted(() => {
    dialog.value?.showModal();
    dialog.value?.focus();
});

onBeforeUnmount(() => {
    dialog.value?.close();
});

</script>
<style scoped>
dialog:focus-visible {
    outline: none;
}

dialog {
    padding: 0;
    border: 1px solid #3b3b3b;
    background-color: #1c1c1c;
    color: #bfbfbf;
    border-radius: 10px;
    width: 640px;
}

form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 10px;
}

header {
    padding: 24px 30px;
    border-bottom: 1px solid #3b3b3b;
}

h1 {
    margin: 0;
    font-size: large;
    color: #89a0ec
}
</style>
