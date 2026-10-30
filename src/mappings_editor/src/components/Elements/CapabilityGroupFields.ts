import type { EditCapabilityGroupRecord } from '@/assets/scripts/MappingFileEditor/EditorCommands/File/EditCapabilityGroups';
import type { FormListField } from './Form/FormListEditor.vue';
import { cleanCapabilityGroupId } from './MetadataValidation';

/** Shared field definitions for creating and editing capability groups. */
export const capabilityGroupFields: FormListField<EditCapabilityGroupRecord>[] = [
    {
        key: 'id',
        label: 'Group ID',
        validate: (value, row, rows) => {
            if (!/^[A-Za-z0-9_ ]+$/.test(value)) {
                return 'Use letters, numbers, spaces and underscores only for the ID.';
            }

            const normalized = cleanCapabilityGroupId(value);
            const duplicate = rows.some(other =>
                other.key !== row.key && cleanCapabilityGroupId(other.id) === normalized
            );
            return duplicate ? 'Duplicate detected. ID must be unique.' : '';
        },
    },
    { key: 'name', label: 'Group Name' },
];
