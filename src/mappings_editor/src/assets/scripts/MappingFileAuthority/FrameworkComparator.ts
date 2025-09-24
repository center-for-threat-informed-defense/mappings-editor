import type { Framework, FrameworkDiff, FrameworkMigration, FrameworkObject } from "./FrameworkRegistry";

export class FrameworkComparator {

    /**
     * The differences between source and target frameworks.
     */
    public readonly diff: FrameworkMigration;


    /**
     * Creates a new {@link FrameworkComparator}.
     */
    constructor() {
        this.diff = {
            added_framework_objects: [],
            removed_framework_objects: [],
            changed_names:  new Map<string, FrameworkObject[]>(),
            changed_descriptions: new Map<string, FrameworkObject[]>(),
            added_mitigations: new Map<string, FrameworkObject[]>(),
            removed_mitigations: new Map<string, FrameworkObject[]>(),
            added_detections: new Map<string, FrameworkObject[]>(),
            removed_detections: new Map<string, FrameworkObject[]>(),
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Compare Frameworks  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Compare changes to FrameworkObjects between source Framework and target Framework
     * @param sourceFramework
     *  The source framework.
     * @param targetFramework
     *  The target framework.
     */
    public compareFrameworks(sourceFramework: Framework, targetFramework: Framework) {

        const diff = this.compareFrameworkObjectArrays(sourceFramework.frameworkObjects, targetFramework.frameworkObjects, "id");

        for (const object of diff.added) {
            this.diff.added_framework_objects.push(object);
        }
        for (const object of diff.removed) {
            this.diff.removed_framework_objects.push(object);
        }
    }

    private compareFrameworkObjectArrays(sourceObjects: Array<FrameworkObject>, targetObjects: Array<FrameworkObject>, key: keyof FrameworkObject): FrameworkDiff {

        const diff: FrameworkDiff = {
            added: [],
            removed: [],
        }

        // Create maps for efficient lookups
        const sourceMap = new Map<string, FrameworkObject>(sourceObjects.map(item => [item[key] as string, item]));
        const targetMap = new Map<string, FrameworkObject>(targetObjects.map(item => [item[key] as string, item]));

        // Find added FrameworkObjects
        for (const targetObject of targetObjects) {
            const commonId = targetObject[key] as string;
            if (!sourceMap.has(commonId)) {
                diff.added.push(targetObject);
            }
        }

        // Find removed and modified FrameworkObjects
        for (const sourceObject of sourceObjects) {
            const commonId = sourceObject[key] as string;
            if (!targetMap.has(commonId)) {
                diff.removed.push(sourceObject);
            }
            else {
                const targetObject = targetMap.get(commonId)!;
                this.compareFrameworkObjects(sourceObject, targetObject);
            }
        }

        return diff;
    }

    private compareFrameworkObjects(sourceObject: FrameworkObject, targetObject: FrameworkObject) {

        const allKeys = new Set([...Object.keys(sourceObject), ...Object.keys(targetObject)]);
        const id = sourceObject["id"];

        for (const key of allKeys) {
            const sourceValue = sourceObject[key];
            const targetValue = targetObject[key];

            // Arrays can only have added or removed type modifications
            if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
                if (JSON.stringify(sourceValue) !== JSON.stringify(targetValue)) {
                    const array_changes = this.compareFrameworkObjectArrays(sourceValue, targetValue, "id");
                    if (key === "mitigations") {
                        for (const mitigation of array_changes.added) {
                            let addedMitigations = this.diff.added_mitigations.get(id);
                            if (!addedMitigations) {
                                addedMitigations = [];
                                this.diff.added_mitigations.set(id, addedMitigations);
                            }
                            addedMitigations.push(mitigation);
                        }
                        for (const mitigation of array_changes.removed) {
                            let removedMitigations = this.diff.removed_mitigations.get(id);
                            if (!removedMitigations) {
                                removedMitigations = [];
                                this.diff.removed_mitigations.set(id, removedMitigations);
                            }
                            removedMitigations.push(mitigation);
                        }
                    }
                    if (key === "detections") {
                        for (const detection of array_changes.added) {
                            let addedDetections = this.diff.added_detections.get(id);
                            if (!addedDetections) {
                                addedDetections = [];
                                this.diff.added_detections.set(id, addedDetections);
                            }
                            addedDetections.push(detection);
                        }
                        for (const detection of array_changes.removed) {
                            let removedDetections = this.diff.removed_detections.get(id);
                            if (!removedDetections) {
                                removedDetections = [];
                                this.diff.removed_detections.set(id, removedDetections);
                            }
                            removedDetections.push(detection);
                        }
                    }
                }
            }

            // Handle string types
            else if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
                if (sourceValue !== targetValue) {
                    if (key === "name") {
                        this.diff.changed_names.set(id, [sourceObject, targetObject]);
                    }
                    if (key === "description") {
                        this.diff.changed_descriptions.set(id, [sourceObject, targetObject]);
                    }
                }
            }
        }
    }
}
