<template>
    <dialog ref="dialog" class="file-creation-screen" aria-labelledby="file-creation-title"
        @close="emit('close')" @keydown.stop @keyup.stop>
        <header>
            <h1 id="file-creation-title">Create New File</h1>
            <p>Choose your ATT&CK framework and describe what you’re mapping.</p>
        </header>
        <ScrollBox ref="creationScrollBox" class="creation-scroll-box" :propagateScroll="false">
            <form @submit.prevent="submit">
                <div class="fields">
                    <label>
                        <span>ATT&CK Version</span>
                        <select v-model="settings.target_version" required autofocus>
                            <option v-for="version in attackVersions" :key="version" :value="version">{{ version }}</option>
                        </select>
                    </label>
                    <label>
                        <span>Domain</span>
                        <select v-model="settings.target_framework" required>
                            <option value="mitre_attack_enterprise">Enterprise</option>
                            <option value="mitre_attack_mobile">Mobile</option>
                            <option value="mitre_attack_ics">ICS</option>
                        </select>
                    </label>
                    <label>
                        <span>Mapping Framework</span>
                        <input v-model="settings.source_framework" type="text" required />
                    </label>
                    <label>
                        <span>Mapping Framework Version</span>
                        <input v-model="settings.source_version" type="text" required />
                    </label>
                    <label>
                        <span>Author <small>(optional)</small></span>
                        <input v-model="settings.author" type="text" autocomplete="name" />
                    </label>
                    <label>
                        <span>Contact <small>(optional)</small></span>
                        <input v-model="settings.author_contact" type="text" />
                    </label>
                    <label class="full-width">
                        <span>Organization <small>(optional)</small></span>
                        <input v-model="settings.author_organization" type="text" autocomplete="organization" />
                    </label>
                </div>
                <details ref="mappingTypesDetails" class="configuration-section"
                    @toggle="onSectionToggle" @invalid.capture="expandMappingTypes">
                    <summary>Mapping Types ({{ mappingTypes.length }})</summary>
                    <button class="add-item" type="button" @click="addMappingType">Add Mapping Type</button>
                    <fieldset v-for="(type, index) in mappingTypes" :key="type.key">
                        <legend>Mapping Type {{ index + 1 }}</legend>
                        <div class="fields">
                            <label>
                                <span>Type ID</span>
                                <input v-model="type.id" type="text" required spellcheck="false" />
                            </label>
                            <label>
                                <span>Type Name</span>
                                <input v-model="type.name" type="text" required />
                            </label>
                            <label class="full-width">
                                <span>Type Description</span>
                                <textarea v-model="type.description" rows="3" required></textarea>
                            </label>
                        </div>
                        <button class="remove-item" type="button"
                            :aria-label="`Remove mapping type ${index + 1}`"
                            @click="mappingTypes.splice(index, 1)">Remove</button>
                    </fieldset>
                </details>
                <details ref="capabilityGroupsDetails" class="configuration-section"
                    @toggle="onSectionToggle" @invalid.capture="expandCapabilityGroups">
                    <summary>Capability Groups ({{ capabilityGroups.length }})</summary>
                    <button class="add-item" type="button" @click="addCapabilityGroup">Add Capability Group</button>
                    <fieldset v-for="(group, index) in capabilityGroups" :key="group.key">
                        <legend>Capability Group {{ index + 1 }}</legend>
                        <div class="fields">
                            <label>
                                <span>Group ID</span>
                                <input v-model="group.id" type="text" required spellcheck="false" />
                            </label>
                            <label>
                                <span>Group Name</span>
                                <input v-model="group.name" type="text" required />
                            </label>
                        </div>
                        <button class="remove-item" type="button"
                            :aria-label="`Remove capability group ${index + 1}`"
                            @click="capabilityGroups.splice(index, 1)">Remove</button>
                    </fieldset>
                </details>
                <p v-if="error" role="alert" class="validation-error">{{ error }}</p>
                <footer>
                    <button type="button" @click="dialog?.close()">Cancel</button>
                    <button type="submit" class="primary">Create File</button>
                </footer>
            </form>
        </ScrollBox>
    </dialog>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import manifest from '@/assets/configuration/app.framework.manifest.json';
import type { FileCreationSettings } from '@/assets/scripts/MappingFileAuthority';
import ScrollBox from '../Containers/ScrollBox.vue';

const emit = defineEmits<{
    (event: 'create', settings: FileCreationSettings): void;
    (event: 'close'): void;
}>();
const dialog = ref<HTMLDialogElement | null>(null);
const mappingTypesDetails = ref<HTMLDetailsElement | null>(null);
const capabilityGroupsDetails = ref<HTMLDetailsElement | null>(null);
const creationScrollBox = ref<InstanceType<typeof ScrollBox> | null>(null);
const error = ref('');
const attackVersions = [...new Set(manifest.files.map(file => file.frameworkVersion))]
    .filter(version => version.localeCompare('8.2', undefined, { numeric: true }) >= 0 &&
        version.localeCompare('19.1', undefined, { numeric: true }) <= 0)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
const settings = reactive({
    target_version: '19.1',
    target_framework: 'mitre_attack_enterprise',
    source_framework: '',
    source_version: '',
    author: '',
    author_contact: '',
    author_organization: '',
});
let nextMappingTypeKey = 0;
const mappingTypes = reactive<{ key: number; id: string; name: string; description: string }[]>([]);
let nextCapabilityGroupKey = 0;
const capabilityGroups = reactive<{ key: number; id: string; name: string }[]>([]);

function addCapabilityGroup() {
    capabilityGroups.push({ key: nextCapabilityGroupKey++, id: '', name: '' });
}

function expandCapabilityGroups() {
    if (capabilityGroupsDetails.value) capabilityGroupsDetails.value.open = true;
}

function addMappingType() {
    mappingTypes.push({ key: nextMappingTypeKey++, id: '', name: '', description: '' });
}

function expandMappingTypes() {
    if (mappingTypesDetails.value) mappingTypesDetails.value.open = true;
}

async function onSectionToggle() {
    await nextTick();
    // Toggling details changes the content height without adding or removing
    // nodes, so ScrollBox's mutation observer does not detect it. Refresh after
    // the layout updates to keep the scrollbar size and scroll range accurate.
    creationScrollBox.value?.scrollbox.refresh();
}

onMounted(() => dialog.value?.showModal());
onBeforeUnmount(() => dialog.value?.close());

function submit() {
    const sourceFramework = settings.source_framework.trim().toLowerCase().replace(/\s+/g, '_');
    const sourceVersion = settings.source_version.trim();
    if (!sourceFramework || !sourceVersion) {
        error.value = 'Enter a mapping framework and its version.';
        return;
    }
    const typeEntries: [string, { name: string; description: string }][] = [];
    const ids = new Set<string>();
    for (const [index, type] of mappingTypes.entries()) {
        const id = type.id.trim().toLowerCase().replace(/\s+/g, '_');
        const name = type.name.trim();
        const description = type.description.trim();
        if (!/^[a-z0-9_]+$/.test(id)) {
            expandMappingTypes();
            error.value = `Mapping type ${index + 1}: use letters, numbers, and underscores only for the ID.`;
            return;
        }
        if (ids.has(id)) {
            expandMappingTypes();
            error.value = `Mapping type ID "${id}" is used more than once. Each type needs a unique ID.`;
            return;
        }
        if (!name || !description) {
            expandMappingTypes();
            error.value = `Mapping type ${index + 1}: enter a name and description.`;
            return;
        }
        ids.add(id);
        typeEntries.push([id, { name, description }]);
    }
    const groupEntries: [string, string][] = [];
    const groupIds = new Set<string>();
    for (const [index, group] of capabilityGroups.entries()) {
        const id = group.id.trim().replace(/\s+/g, '_');
        const name = group.name.trim();
        if (!/^[A-Za-z0-9_]+$/.test(id)) {
            expandCapabilityGroups();
            error.value = `Capability group ${index + 1}: use letters, numbers, and underscores only for the ID.`;
            return;
        }
        if (groupIds.has(id)) {
            expandCapabilityGroups();
            error.value = `Capability group ID "${id}" is used more than once. Each group needs a unique ID.`;
            return;
        }
        if (!name) {
            expandCapabilityGroups();
            error.value = `Capability group ${index + 1}: enter a name.`;
            return;
        }
        groupIds.add(id);
        groupEntries.push([id, name]);
    }
    error.value = '';
    emit('create', {
        ...settings,
        source_framework: sourceFramework,
        source_version: sourceVersion,
        author: settings.author.trim() || null,
        author_contact: settings.author_contact.trim() || null,
        author_organization: settings.author_organization.trim() || null,
        mapping_types: Object.fromEntries(typeEntries),
        capability_groups: Object.fromEntries(groupEntries),
    });
}
</script>

<style scoped>
.file-creation-screen {
    width: 640px;
    max-width: calc(100vw - 32px);
    max-height: 90vh;
    height: fit-content;
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
    border: 1px solid var(--me-border-color-1);
    border-radius: 10px;
    background: var(--me-background-color-2);
    color: var(--me-text-color-1);
    color-scheme: dark;
}
.file-creation-screen[open] {
    display: flex;
    flex-direction: column;
}
.creation-scroll-box {
    flex: 0 1 auto;
    min-height: 0;
}
.creation-scroll-box :deep(.scroll-bar) {
    margin: 8px 6px 8px 0;
    border: 1px solid var(--me-border-color-1);
    border-radius: 5px;
}
.creation-scroll-box :deep(.scroll-handle) {
    background: var(--me-background-color-3);
    border-color: var(--me-border-color-2);
}
.file-creation-screen::backdrop {
    background: rgb(0 0 0 / 30%);
    backdrop-filter: blur(5px);
}
header {
    flex-shrink: 0;
    padding: 24px 30px;
    border-bottom: 1px solid var(--me-border-color-1);
}
h1 {
    margin: 0 0 8px;
    font-size: large;
    color: var(--me-text-color-emphasis);
}
header p { margin: 0; font-size: small; }
form { padding: 24px 30px; }
.fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
}
label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: small;
}
small { font-size: inherit; opacity: 0.75; }
.full-width { grid-column: 1 / -1; }
input, select, textarea {
    width: 100%;
    min-width: 0;
    padding: 10px 12px;
    box-sizing: border-box;
    border: 1px solid var(--me-border-color-2);
    border-radius: 5px;
    background: var(--me-background-color-3);
    color: var(--me-text-color-1);
    font: inherit;
}
input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible, summary:focus-visible {
    outline: 2px solid var(--me-text-color-emphasis);
    outline-offset: 2px;
}
footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 28px;
}
button {
    padding: 10px 18px;
    border: 1px solid var(--me-border-color-2);
    border-radius: 5px;
    background: var(--me-background-color-3);
    color: var(--me-text-color-1);
    font: inherit;
    cursor: pointer;
}
button:hover { filter: brightness(1.15); }
.primary { background: var(--me-background-color-emphasis); color: white; }
.configuration-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--me-border-color-1);
}
summary { cursor: pointer; font-size: small; font-weight: 600; }
.add-item { margin-top: 12px; }
fieldset {
    min-width: 0;
    margin: 16px 0 0;
    padding: 16px;
    border: 1px solid var(--me-border-color-2);
    border-radius: 5px;
}
legend { padding: 0 6px; font-size: small; }
textarea { resize: vertical; }
.remove-item { margin-top: 12px; }
@media (max-width: 520px) {
    .fields { grid-template-columns: minmax(0, 1fr); }
}

.validation-error {
    color: var(--me-text-color-error);
    margin-top: 5px;
}
</style>
