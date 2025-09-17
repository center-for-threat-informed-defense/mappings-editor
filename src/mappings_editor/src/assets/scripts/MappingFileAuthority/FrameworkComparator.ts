import type { FrameworkDiff, FrameworkObject, FrameworkRegistry } from "./FrameworkRegistry";

export class FrameworkComparator {

    /**
     * The framework comparator's framework registry.
     */
    public readonly registry: FrameworkRegistry;

    /**
     * The list of framework object additions.
     */
    public readonly added_framework_objects: FrameworkObject[];

    /**
     * The list of framework object removals.
     */
    public readonly removed_framework_objects: FrameworkObject[];

    /**
     * The internal map of changed framework object names.
     */
    private _changed_names: Map<string, [string, string]>;

    /**
     * The internal map of changed framework object descriptions.
     */
    private _changed_descriptions: Map<string, [string, string]>;

    /**
     * The internal map of added mitigations to framework objects.
     */
    private _added_mitigations: Map<string, FrameworkObject[]>;

    /**
     * The internal map of removed mitigations from framework objects.
     */
    private _removed_mitigations: Map<string, FrameworkObject[]>;

    /**
     * The internal map of added detections to framework objects.
     */
    private _added_detections: Map<string, FrameworkObject[]>;

    /**
     * The internal map of removed detections from framework objects.
     */
    private _removed_detections: Map<string, FrameworkObject[]>;

    /**
     * The changed framework object names.
     */
    public get changedNames(): ReadonlyMap<string, [string, string]> {
        return this._changed_names;
    }

    /**
     * The changed framework object descriptions.
     */
    public get changedDescriptions(): ReadonlyMap<string, [string, string]> {
        return this._changed_descriptions;
    }

    /**
     * The changed framework object descriptions.
     */
    public get addedMitigations(): ReadonlyMap<string, FrameworkObject[]> {
        return this._added_mitigations;
    }

    /**
     * The changed framework object descriptions.
     */
    public get removedMitigations(): ReadonlyMap<string, FrameworkObject[]> {
        return this._removed_mitigations;
    }

    /**
     * The changed framework object descriptions.
     */
    public get addedDetections(): ReadonlyMap<string, FrameworkObject[]> {
        return this._added_detections;
    }

    /**
     * The changed framework object descriptions.
     */
    public get removedDetections(): ReadonlyMap<string, FrameworkObject[]> {
        return this._removed_detections;
    }


    /**
     * Creates a new {@link FrameworkComparator}.
     * @param registry
     *  The framework comparator's framework registry.
     */
    constructor(registry: FrameworkRegistry) {
        this.registry = registry;
        this.added_framework_objects = [];
        this.removed_framework_objects = [];
        this._changed_names = new Map<string, [string, string]>();
        this._changed_descriptions = new Map<string, [string, string]>();
        this._added_mitigations = new Map<string, FrameworkObject[]>();
        this._removed_mitigations = new Map<string, FrameworkObject[]>();
        this._added_detections = new Map<string, FrameworkObject[]>();
        this._removed_detections = new Map<string, FrameworkObject[]>();
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Compare Frameworks  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Compare changes to FrameworkObjects between source Framework and target Framework
     * @param sourceID
     *  The source framework's identifier.
     * @param sourceVersion
     *  The source framework's version.
     * @param targetID
     *  The target framework's identifier.
     * @param targetVersion
     *  The target framework's version.
     */
    public async compareFrameworks(sourceID: string, sourceVersion: string, targetID: string, targetVersion: string) {

        // Can only compare frameworks with the same identifier
        if(sourceID !== targetID) {
            throw new Error(`Cannot compare frameworks with identifiers '${ sourceID }' and '${ targetID }'.`);
        }

        // Pull frameworks from registry
        const sourceFramework = await this.registry.getFramework(sourceID, sourceVersion);
        const targetFramework = await this.registry.getFramework(targetID, targetVersion);

        const diff = this.compareFrameworkObjectArrays(sourceFramework.frameworkObjects, targetFramework.frameworkObjects, "id");

        for (const object of diff.added) {
            this.added_framework_objects.push(object);
        }
        for (const object of diff.removed) {
            this.removed_framework_objects.push(object);
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
                            let addedMitigations = this.addedMitigations.get(id);
                            if (!addedMitigations) {
                                addedMitigations = [];
                                this._added_mitigations.set(id, addedMitigations);
                            }
                            addedMitigations.push(mitigation);
                        }
                        for (const mitigation of array_changes.removed) {
                            let removedMitigations = this.removedMitigations.get(id);
                            if (!removedMitigations) {
                                removedMitigations = [];
                                this._removed_mitigations.set(id, removedMitigations);
                            }
                            removedMitigations.push(mitigation);
                        }
                    }
                    if (key === "detections") {
                        for (const detection of array_changes.added) {
                            let addedDetections = this.addedDetections.get(id);
                            if (!addedDetections) {
                                addedDetections = [];
                                this._added_detections.set(id, addedDetections);
                            }
                            addedDetections.push(detection);
                        }
                        for (const detection of array_changes.removed) {
                            let removedDetections = this.removedDetections.get(id);
                            if (!removedDetections) {
                                removedDetections = [];
                                this._removed_detections.set(id, removedDetections);
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
                        this._changed_names.set(id, [sourceValue, targetValue]);
                    }
                    if (key === "description") {
                        this._changed_descriptions.set(id, [sourceValue, targetValue]);
                    }
                }
            }
        }
    }
}
