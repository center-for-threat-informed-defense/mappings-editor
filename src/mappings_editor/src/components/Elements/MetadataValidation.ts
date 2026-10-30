/**
 * Trim hanging whitespace and replace spaces with underscores.
 * @param val The capability group id to clean
 * @returns the cleaned id
 */
export function cleanCapabilityGroupId(val: string): string {
    // The capability group id should only contain alphanumeric characters and spaces
    // should be replaced with underscores.
    return val.trim().replace(/\s+/g, '_');
}

/** Normalize mapping type IDs for validation and file creation. */
export function cleanMappingTypeId(val: string): string {
    return val.trim().toLowerCase().replace(/\s+/g, '_');
}
