<template>
    <dialog
        ref="dialog"
        class="splash-container"
        aria-labelledby="splash-title"
    >
            <div class="splash-header">
                <div>
                    <h1 id="splash-title">Mappings Editor</h1>
                    <div style="font-size: small;">Version 1.5.0</div>
                </div>
                
                <img src="@/assets/images/ctid_logo.png" alt="MITRE CTID" height="27"/>
            </div>
            <div class="splash-body">
                <h2>Recover File</h2>
                <ScrollBox class="splash-scroll-box">
                    <div class="file-recovery-container">
                        <div v-for="_ in 7" class="file-recovery-row">
                            <button class="file-recovery-file">
                                <span>File Name</span>
                                <span>Timestamp</span>
                            </button>
                            <button class="file-recovery-delete">
                                Delete <XMark width="10" height="10"/>
                            </button>
                        </div>
                    </div>
                </ScrollBox>
                <h2>Open File</h2>
                <div class="button-row">
                    <button class="splash-button" @click="emit('create-file')">
                        <span class="splash-button-title">
                            <FileIcon/> Create New File
                        </span>
                        <span class="splash-button-description">Create new mappings file</span>
                    </button>
                    <button class="splash-button" @click="emit('open-file')">
                        <span class="splash-button-title">
                            <FolderOpen /> Open File
                        </span>
                        <span class="splash-button-description">Open existing mappings file</span>
                    </button>
                </div>
                <h2>Resources</h2>
                <div class="button-row">
                    <a
                        class="splash-button"
                        href="https://github.com/center-for-threat-informed-defense/mappings-editor/wiki"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span class="splash-button-title">
                            <ReadmeIcon /> User Guide
                        </span>
                        <span class="splash-button-description">Quick-start guide and examples</span>
                    </a>
                    <a
                        class="splash-button"
                        href="https://github.com/center-for-threat-informed-defense/mappings-editor/blob/main/src/mappings_editor/CHANGELOG.md"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span class="splash-button-title">
                            <ListIcon /> Change Log
                        </span>
                        <span class="splash-button-description">Latest features and fixes</span>
                    </a>
                </div>

                <div style="text-align: right;">
                    <button
                        style="
                            margin-top: 30px;
                            background: none;
                            border: none;
                            color: var(--me-text-color-emphasis);
                            cursor: pointer;
                        "
                        @click="emit('close')"
                    >
                        <span style="display: flex; align-items: center; gap: 5px;">
                            Continue to editor
                            <ArrowRight></ArrowRight>
                        </span>
                    </button>
                </div>
            </div>
    </dialog>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import ScrollBox from '../Containers/ScrollBox.vue';
import ArrowRight from '../Icons/ArrowRight.vue';
import FileIcon from '../Icons/FileIcon.vue';
import FolderOpen from '../Icons/FolderOpen.vue';
import ReadmeIcon from '../Icons/ReadmeIcon.vue';
import ListIcon from '../Icons/ListIcon.vue';
import XMark from '../Icons/XMark.vue';
const emit = defineEmits(['close', 'open-file', 'create-file']);
const dialog = ref<HTMLDialogElement | null>(null);

onMounted(() => {
    dialog.value?.showModal();
});

onBeforeUnmount(() => {
    dialog.value?.close();
});
</script>
<style scoped>
.splash-container::backdrop {
    background: transparent;
    backdrop-filter: blur(5px);
}
.splash-container {
    background-color: var(--me-background-color-2);
    width: 740px;
    padding: 0;
    border: 1px solid var(--me-border-color-1);
    border-radius: 10px;
    overflow: hidden;
    color: var(--me-text-color-1);
}

.splash-header {
    background-color: var(--me-background-color-2);
    border-bottom: 1px solid var(--me-border-color-1);
    padding: 18px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
}

.splash-header h1 {
    margin: 0;
    font-size: large;
}

.splash-body {
    padding: 30px;
}

.splash-body h2 {
    font-size: small;
    font-weight: normal;
    text-transform: uppercase;
}

.button-row {
    display: flex;
    gap: 10px;
}

.splash-button {
    text-decoration: none;
    background: none;
    border: 1px solid rgb(56, 56, 56);
    border-radius: 7px;
    padding: 24px;
    text-align: left;
    flex: 1;
    color: var(--me-text-color-1);
}

.splash-button:hover {
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.1);
}

.splash-button-title {
    display: block;
    font-size: large;
    color: var(--me-text-color-emphasis);
}

.splash-button-description {
    display: block;
    font-size: small;
}

.file-recovery-container {
    max-height: 100px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.splash-scroll-box :deep(.scroll-bar) {
    border-radius: 5px;
    border: 1px solid var(--me-border-color-1);
    margin-left: 5px;
}

.file-recovery-row {
    display: flex;
    width: 100%;
    gap: 5px;
}
.file-recovery-file {
    flex: 1;
    display: flex;
    justify-content: space-between;
    border-radius: 5px;
    border: 1px solid var(--me-border-color-1);
    padding: 5px;
    background: none;
    color: var(--me-text-color-1);
}
.file-recovery-delete {
    background: none;
    color: var(--me-text-color-emphasis);
    border: 1px solid var(--me-border-color-1);
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 3px;
}
</style>
