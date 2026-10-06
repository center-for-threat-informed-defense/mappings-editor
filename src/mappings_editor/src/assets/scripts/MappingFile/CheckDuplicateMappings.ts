import type { MappingFile } from "./MappingFile";

/** Recomputes duplicate problems while preserving other audit problems. */
export function checkDuplicateMappings(file: MappingFile): void {
    const mappings = [...file.mappingObjects.values()];
    for (const mapping of mappings) {
        mapping.problems = mapping.problems.filter(
            problem => problem.problemType !== "duplicate"
        );
        const duplicates = mappings.filter(other =>
            other.id !== mapping.id &&
            other.sourceObject.objectId === mapping.sourceObject.objectId &&
            other.targetObject.objectId === mapping.targetObject.objectId &&
            other.scoreValue.exportValue === mapping.scoreValue.exportValue &&
            other.scoreCategory.exportValue === mapping.scoreCategory.exportValue
        );
        if (duplicates.length > 0) {
            mapping.problems.push({
                problemType: "duplicate",
                duplicateMappings: duplicates,
            });
        }
    }
}
