import type { EditMappingTypeRecord } from '@/assets/scripts/MappingFileEditor/EditorCommands/File/EditMappingTypes';
import type { FormListField } from './Form/FormListEditor.vue';
import { cleanMappingTypeId } from './MetadataValidation';

/** Shared field definitions for creating and editing mapping types. */
export const mappingTypeFields: FormListField<EditMappingTypeRecord>[] = [
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
