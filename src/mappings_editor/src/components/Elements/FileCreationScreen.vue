<template>
    <dialog
        ref="dialog"
        class="file-creation-screen"
        aria-labelledby="file-creation-title"
        @keydown.stop
        @keyup.stop
        @close="emit('close')"
    >
        <header>
            <h1 id="file-creation-title">New File</h1>
            <p>Choose your ATT&CK framework and describe what you're mapping.</p>
        </header>
        <ScrollBox ref="creationScrollBox" class="creation-scroll-box" :propagateScroll="false">
            <form @submit.prevent="submit">
                <div class="fields">
                    <FormDropdown
                        title="Domain"
                        required
                        :options="domainOptions"
                        :error-message="errors.target_framework"
                        v-model="settings.target_framework"
                    />
                    <FormDropdown
                        title="ATT&CK Version"
                        required
                        :options="attackVersionsByDomain.get(settings.target_framework) ?? []"
                        :error-message="errors.target_version"
                        v-model="settings.target_version"
                    />
                    <FormTextField
                        title="Mapping Framework"
                        v-model="settings.source_framework"
                        :error-message="errors.source_framework"
                        required
                    />
                    <FormTextField
                        title="Mapping Framework Version"
                        v-model="settings.source_version"
                        :error-message="errors.source_version"
                        required
                    />
                    <FormTextField
                        title="Author"
                        v-model="settings.author"
                        autocomplete="name"
                        :error-message="errors.author"
                    />
                    <FormTextField
                        title="Contact"
                        v-model="settings.author_contact"
                        :error-message="errors.author_contact"
                    />
                    <FormTextField
                        class="full-width"
                        title="Organization"
                        v-model="settings.author_organization"
                        autocomplete="organization"
                        :error-message="errors.author_organization"
                    />
                </div>
                <details ref="mappingTypesDetails" class="configuration-section"
                    @toggle="onSectionToggle" @invalid.capture="expandMappingTypes">
                    <summary>Mapping Types ({{ mappingTypes.length }})</summary>
                    <FormListEditor
                        v-model="mappingTypes"
                        v-model:is-valid="mappingTypesAreValid"
                        item-label="Mapping Type"
                        :fields="mappingTypeFields"
                    />
                </details>
                <details ref="capabilityGroupsDetails" class="configuration-section"
                    @toggle="onSectionToggle" @invalid.capture="expandCapabilityGroups">
                    <summary>Capability Groups ({{ capabilityGroups.length }})</summary>
                    <FormListEditor
                        v-model="capabilityGroups"
                        v-model:is-valid="capabilityGroupsAreValid"
                        item-label="Capability Group"
                        :fields="capabilityGroupFields"
                    />
                </details>
                <p class="validation-summary-message">
                    <span v-if="validationSummaryErrorMessage">{{ validationSummaryErrorMessage }}</span>
                    <span v-else class="validation-successful">Validation Successful <CircleCheck /></span>
                </p>
                <footer>
                    <button type="button" @click="emit('close');">Cancel</button>
                    <button type="submit" :disabled="disableSubmit">Create File</button>
                </footer>
            </form>
        </ScrollBox>
    </dialog>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, computed } from 'vue';
import manifest from '@/assets/configuration/app.framework.manifest.json';
import type { FileCreationSettings } from '@/assets/scripts/MappingFileAuthority';
import ScrollBox from '../Containers/ScrollBox.vue';
import FormTextField from './Form/FormTextField.vue';
import FormDropdown from './Form/FormDropdown.vue';
import CircleCheck from '../Icons/CircleCheck.vue';
import { capabilityGroupFields } from './CapabilityGroupFields';
import FormListEditor, { type FormListField } from './Form/FormListEditor.vue';
import { cleanCapabilityGroupId, cleanMappingTypeId } from './MetadataValidation.js';
import type { EditCapabilityGroupRecord } from '@/assets/scripts/MappingFileEditor/EditorCommands/File/EditCapabilityGroups.js';

interface MappingTypeRecord {
    key: string;
    id: string;
    name: string;
    description: string;
}

const mappingTypeFields: FormListField<MappingTypeRecord>[] = [
    {
        key: 'id',
        label: 'Type ID',
        validate: (value, row, rows) => {
            if (!/^[A-Za-z0-9_ ]+$/.test(value)) {
                return 'Use letters, numbers, spaces and underscores only for the ID.';
            }

            const normalized = cleanMappingTypeId(value);
            const duplicate = rows.some(other =>
                other.key !== row.key && cleanMappingTypeId(other.id) === normalized
            );
            return duplicate ? 'Duplicate detected. ID must be unique.' : '';
        },
    },
    { key: 'name', label: 'Type Name' },
    { key: 'description', label: 'Type Description', multiline: true },
];

const domainOptions = [
    { value: 'mitre_attack_enterprise', text: 'Enterprise' },
    { value: 'mitre_attack_mobile', text: 'Mobile' },
    { value: 'mitre_attack_ics', text: 'ICS' }
];

const emit = defineEmits<{
    (event: 'create', settings: FileCreationSettings): void;
    (event: 'close'): void;
}>();
const dialog = ref<HTMLDialogElement | null>(null);
const mappingTypesDetails = ref<HTMLDetailsElement | null>(null);
const capabilityGroupsDetails = ref<HTMLDetailsElement | null>(null);
const creationScrollBox = ref<InstanceType<typeof ScrollBox> | null>(null);

/**
 * Check that a value is truthy. Return an error message if not.
 * @param val The value to check
 * @returns a blank string if the value is valid, else an error string.
 */
function validateExists(val: string): string {
    if (val) return "";
    return "This field is required.";
}


const errors = computed(() => ({
    source_framework: validateExists(settings.source_framework),
    source_version: validateExists(settings.source_version),
    target_framework: validateExists(settings.target_framework),
    target_version: validateExists(settings.target_version),
    author: "",
    author_contact: "",
    author_organization: ""
    
}));

const disableSubmit = computed(() => {
    const mtErrors : boolean = !mappingTypesAreValid.value;
    const cgErrors : boolean = !capabilityGroupsAreValid.value;
    const otherErrors : boolean = Object.values(errors.value).some(val => val);
    return mtErrors || cgErrors || otherErrors;
});

const validationSummaryErrorMessage = computed(() => {
    const otherErrors : boolean = Object.values(errors.value).some(val => val);
    if (otherErrors) {
        return "Fill out all required fields to continue.";
    }
    const mtErrors : boolean = !mappingTypesAreValid.value;
    if (mtErrors) {
        return "Mapping Types contains errors.";
    }
    const cgErrors : boolean = !capabilityGroupsAreValid.value;
    if (cgErrors) {
        return "Capability Groups contains errors.";
    }
    
    return "";

});

function getAttackVersionsByDomain() : Map<string, { value: string, text: string}[]>{
    const result = new Map<string, { value: string, text: string}[]>();
    
    for (const f of manifest.files) {
        if (!result.has(f.frameworkId)) {
            result.set(f.frameworkId, []);
        }

        result.get(f.frameworkId)?.push({ value: f.frameworkVersion, text: f.frameworkVersion });
    }

    for (const val of result.values()) {
        val.sort((a, b) => b.text.localeCompare(a.text, undefined, { numeric: true }));
    }

    return result;
}

const attackVersionsByDomain = getAttackVersionsByDomain();
const defaultTargetFramework = 'mitre_attack_enterprise';
const settings = reactive({
    target_version: attackVersionsByDomain.get(defaultTargetFramework)?.[0].value ?? '',
    target_framework: defaultTargetFramework,
    source_framework: '',
    source_version: '',
    author: '',
    author_contact: '',
    author_organization: '',
});
const mappingTypes = ref<MappingTypeRecord[]>([]);
const mappingTypesAreValid = ref(false);
const capabilityGroups = ref<EditCapabilityGroupRecord[]>([]);
const capabilityGroupsAreValid = ref(false);

function expandCapabilityGroups() {
    if (capabilityGroupsDetails.value) capabilityGroupsDetails.value.open = true;
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

onMounted(() => {
    dialog.value?.showModal();
    // Prevent inputs from automatically receiving unsightly focus outline.
    dialog.value?.focus();
});
onBeforeUnmount(() => dialog.value?.close());

function submit() {
    const sourceFramework = settings.source_framework.trim().toLowerCase().replace(/\s+/g, '_');
    const sourceVersion = settings.source_version.trim();
    const typeEntries: [string, { name: string; description: string }][] = [];
    const ids = new Set<string>();
    for (const type of mappingTypes.value) {
        const id = cleanMappingTypeId(type.id);
        const name = type.name.trim();
        const description = type.description.trim();
        ids.add(id);
        typeEntries.push([id, { name, description }]);
    }
    const groupEntries: [string, string][] = [];
    const groupIds = new Set<string>();
    for (const group of capabilityGroups.value) {
        const id = cleanCapabilityGroupId(group.id);
        const name = group.name.trim();
        groupIds.add(id);
        groupEntries.push([id, name]);
    }

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
    border: 1px solid var(--me-border-color-subtle);
    border-radius: 10px;
    background: var(--me-bg-color-recessed);
    color: var(--me-text-color);
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
    margin: 0;
    border: 1px solid var(--me-border-color-subtle);
    border-radius: 5px;
}
.creation-scroll-box :deep(.scroll-handle) {
    background: var(--me-bg-color-recessed);
    border-color: var(--me-border-color-strong);
}
.file-creation-screen::backdrop {
    background: rgb(0 0 0 / 30%);
    backdrop-filter: blur(5px);
}
header {
    flex-shrink: 0;
    padding: 24px 30px;
    border-bottom: 1px solid var(--me-border-color-subtle);
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
    border: 1px solid var(--me-border-color-strong);
    border-radius: 5px;
    background: var(--me-bg-color-recessed);
    color: var(--me-text-color);
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
.configuration-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--me-border-color-subtle);
}
summary { cursor: pointer; font-size: small; font-weight: 600; }


@media (max-width: 520px) {
    .fields { grid-template-columns: minmax(0, 1fr); }
}

.validation-summary-message {
    font-size: small;
    text-align: center;
    margin-top: 1rem;
}
.validation-summary-message .validation-successful {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}
</style>
