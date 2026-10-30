import type { ApplicationStore } from "@/stores/ApplicationStore";
import { StringProperty, type ListItem, type ListItemProperty } from "@/assets/scripts/MappingFile";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import { MappingObjectDiscriminator } from "../../MappingFileView/MappingObjectDiscriminator";
import { MappingTypeSectionView } from "../../MappingFileView/MappingFileViewItem/MappingTypeSectionView";

/** A mapping type row returned by the edit modal. */
export interface EditMappingTypeRecord {
    /** Existing ListItem.id, or a draft UUID for a new row. */
    key: string;
    id: string;
    name: string;
    description: string;
}

type MappingTypeSnapshot = {
    item: ListItem;
    id: string;
    name: string;
    description: string;
};

export class EditMappingTypes extends EditorCommand {
    private context: ApplicationStore;
    private previousTypes: MappingTypeSnapshot[] | null = null;
    private updatedTypes: MappingTypeSnapshot[] | null = null;
    private previousFilters: (string | null)[] = [];
    private previousAssignments: {
        prop: Pick<ListItemProperty, "value" | "cacheValue">;
        value: string | null;
        cached: boolean;
        exportValue: string | null;
        exportText: string | null;
    }[] = [];

    constructor(context: ApplicationStore) {
        super();
        this.context = context;
    }

    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        const editedTypes = await this.context.askEditMappingTypes();
        if (editedTypes === null) {
            return;
        }

        const types = this.context.activeEditor.file.mappingTypes;
        const currentItems = [...types.value.values()];
        // Skip unchanged lists so confirming without edits doesn't create an undo entry or trigger autosave.
        if (currentItems.length === editedTypes.length && editedTypes.every((type, index) => {
            const item = currentItems[index];
            return item.id === type.key
                && item.getAsString("id") === type.id
                && item.getAsString("name") === type.name
                && item.getAsString("description") === type.description;
        })) {
            return;
        }

        this.recordExistingMappingTypes();
        this.updatedTypes = editedTypes.map(({ key, id, name, description }) => ({
            item: types.value.get(key) ?? types.createNewItem({ id, name, description }),
            id,
            name,
            description,
        }));
        this.applyUpdatedMappingTypes(issueDirective);
        issueDirective(EditorDirective.Record);
    }

    public async redo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.applyUpdatedMappingTypes(issueDirective);
    }

    private applyUpdatedMappingTypes(issueDirective: DirectiveIssuer): void {
        if (this.updatedTypes === null) {
            return;
        }

        const editor = this.context.activeEditor;
        const types = editor.file.mappingTypes;
        const retainedIds = new Set(this.updatedTypes.map(({ item }) => item.id));
        const deletedIds = new Set([...types.value.keys()].filter(id => !retainedIds.has(id)));
        const objects = [editor.file.mappingObjectTemplate, ...editor.file.mappingObjects.values()];

        // Deleting a type clears assignments to it, including the default.
        for (const object of objects) {
            if (object.mappingType.value !== null && deletedIds.has(object.mappingType.value)) {
                object.mappingType.value = null;
            }
        }

        this.restoreTypes(this.updatedTypes);

        // Refresh fallback text/IDs on surviving assignments after renames.
        for (const object of objects) {
            object.mappingType.refreshCachedValue();
        }

        const filters = editor.view.filterSets.get(MappingObjectDiscriminator.MappingType);
        for (const id of deletedIds) {
            filters?.hide(id);
        }
        this.refreshView(issueDirective);
    }

    /** Records the original items, values, and order for undo only once. */
    private recordExistingMappingTypes(): void {
        if (this.previousTypes !== null) {
            return;
        }

        this.previousTypes = [...this.context.activeEditor.file.mappingTypes.value.values()].map(
            item => ({
                item,
                id: item.getAsString("id"),
                name: item.getAsString("name"),
                description: item.getAsString("description"),
            })
        );

        const editor = this.context.activeEditor;
        this.previousFilters = [...(editor.view.filterSets.get(
            MappingObjectDiscriminator.MappingType
        )?.appliedFilters ?? [])];
        this.previousAssignments = [
            editor.file.mappingObjectTemplate,
            ...editor.file.mappingObjects.values(),
        ].map(({ mappingType: prop }) => ({
            prop,
            value: prop.value,
            cached: prop.isValueCached(),
            exportValue: prop.exportValue,
            exportText: prop.exportText,
        }));
    }

    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        if (this.previousTypes === null) {
            return;
        }

        this.restoreTypes(this.previousTypes);

        // Restore assignments, including the default, after their options exist again.
        for (const saved of this.previousAssignments) {
            if (saved.cached) {
                saved.prop.cacheValue(saved.exportValue!, saved.exportText!);
            } else {
                saved.prop.value = saved.value;
            }
        }

        const filters = this.context.activeEditor.view.filterSets.get(MappingObjectDiscriminator.MappingType);
        filters?.showAll();
        for (const id of this.previousFilters) {
            filters?.show(id);
        }
        this.refreshView(issueDirective);
    }

    /** Restores item identities, order, and editable values. */
    private restoreTypes(snapshot: MappingTypeSnapshot[]): void {
        const types = this.context.activeEditor.file.mappingTypes;
        for (const item of [...types.value.values()]) {
            types.removeListItem(item);
        }
        for (const { item, id, name, description } of snapshot) {
            (item.get("id") as StringProperty).value = id;
            (item.get("name") as StringProperty).value = name;
            (item.get("description") as StringProperty).value = description;
            types.insertListItem(item);
        }
    }

    private refreshView(issueDirective: DirectiveIssuer): void {
        const editor = this.context.activeEditor;
        const types = editor.file.mappingTypes;
        // Rebuilding reuses sections, so refresh labels on surviving types.
        for (const section of editor.view.getItems()) {
            if (section instanceof MappingTypeSectionView && section.value !== null) {
                const item = types.value.get(section.value);
                if (item) {
                    section.exportText = item.getAsString("name");
                    section.name = section.exportText;
                }
            }
        }
        editor.view.rebuildBreakouts();
        for (const id of editor.file.mappingObjects.keys()) {
            issueDirective(EditorDirective.Reindex, id);
        }
        issueDirective(EditorDirective.Autosave);
    }
}
