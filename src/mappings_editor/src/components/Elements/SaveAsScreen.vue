<template>
    <dialog
        ref="dialog"
        @keydown.stop
        @keyup.stop
    >
        <header>
            <h1>Save As</h1>
            <small>
                Enter a name for this file and save it.
            </small>
        </header>
        <form @submit.prevent="onFormSubmit">
            <div style="width: 100%;">
                <div style="margin-bottom: 5px;">
                    <label for="filename-input">
                        <small>Filename</small>
                    </label>
                </div>

                <div style="display: flex; align-items: baseline; gap: 3px;">
                    <input
                        id="filename-input"
                        v-model="fileName"
                        type="text"
                        required
                        style="flex: 1;"
                    />
                    <small>.{{ config.file_type_extension }}</small>
                </div>

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
import config from '@/assets/configuration/app.config';

const app = useApplicationStore();

const dialog = useTemplateRef('dialog');

const fileName = ref(app.activeEditor.name);

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

dialog::backdrop {
    background: rgb(0 0 0 / 30%);
    backdrop-filter: blur(5px);
}

form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px 30px;
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

input[type="text"] {
    background-color: #303030;
    border: none;
    color: #bfbfbf;
    padding: 0px 10px;
    border-radius: 3px;
    height: 30px;
}
</style>
