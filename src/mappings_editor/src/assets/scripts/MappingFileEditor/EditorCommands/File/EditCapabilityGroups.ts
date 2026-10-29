import type { ApplicationStore } from "@/stores/ApplicationStore";
import { StringProperty, type ListItem, type ListItemProperty } from "@/assets/scripts/MappingFile";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import { CapabilityGroupSectionView } from "../../MappingFileView/MappingFileViewItem/CapabilityGroupSectionView";
import { MappingObjectDiscriminator } from "../../MappingFileView/MappingObjectDiscriminator";

export interface EditCapabilityGroupRecord {
    /** Internal unique key (primary key) that may correspond with ListItem id */
    key: string;
    /** Capability group name */
    name: string;
    /** Capability group id */
    id: string;
}

type CapabilityGroupSnapshot = { item: ListItem; id: string; name: string };

export class EditCapabilityGroups extends EditorCommand {
    private context: ApplicationStore
    private previousGroups: CapabilityGroupSnapshot[] | null = null;
    private updatedGroups: CapabilityGroupSnapshot[] | null = null;
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
        const editedGroups = await this.context.askEditCapabilityGroups();
        if (editedGroups === null) {
            // The command was canceled. Nothing to do.
            return;
        }
        const groups = this.context.activeEditor.file.capabilityGroups;
        const currentItems = [...groups.value.values()];
        // Skip unchanged lists so confirming without edits doesn't create an undo entry or trigger autosave.
        if (currentItems.length === editedGroups.length && editedGroups.every((group, index) => {
            const item = currentItems[index];
            return item.id === group.key
                && item.getAsString("id") === group.id
                && item.getAsString("name") === group.name;
        })) {
            return;
        }

        this.recordExistingCapabilityGroups();
        this.updatedGroups = editedGroups.map(({ key, id, name }) => ({
            item: groups.value.get(key) ?? groups.createNewItem({ id, name }),
            id,
            name,
        }));
        this.applyUpdatedCapabilityGroups(issueDirective);
        issueDirective(EditorDirective.Record);
    }

    public async redo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        this.applyUpdatedCapabilityGroups(issueDirective);
    }

    private applyUpdatedCapabilityGroups(issueDirective: DirectiveIssuer): void {
        if (this.updatedGroups === null) {
            return;
        }

        const editor = this.context.activeEditor;
        const groups = editor.file.capabilityGroups;
        const retainedIds = new Set(this.updatedGroups.map(({ item }) => item.id));
        const deletedIds = new Set([...groups.value.keys()].filter(id => !retainedIds.has(id)));

        // Deleting a group clears assignments to it, including the template.
        for (const object of [editor.file.mappingObjectTemplate, ...editor.file.mappingObjects.values()]) {
            if (object.capabilityGroup.value !== null && deletedIds.has(object.capabilityGroup.value)) {
                object.capabilityGroup.value = null;
            }
        }

        this.restoreGroups(this.updatedGroups);

        // Refresh fallback text/IDs on surviving assignments after renames.
        for (const object of [editor.file.mappingObjectTemplate, ...editor.file.mappingObjects.values()]) {
            const prop = object.capabilityGroup;
            if (prop.value !== null && groups.value.has(prop.value)) {
                prop.value = prop.value;
            }
        }

        const filters = editor.view.filterSets.get(MappingObjectDiscriminator.CapabilityGroup);
        for (const id of deletedIds) {
            filters?.hide(id);
        }
        this.refreshView(issueDirective);
    }

    /** Reuses original item identities and applies the supplied order and values. */
    private restoreGroups(snapshot: CapabilityGroupSnapshot[]): void {
        const groups = this.context.activeEditor.file.capabilityGroups;
        for (const item of [...groups.value.values()]) {
            groups.removeListItem(item);
        }
        for (const { item, id, name } of snapshot) {
            (item.get("id") as StringProperty).value = id;
            (item.get("name") as StringProperty).value = name;
            groups.insertListItem(item);
        }
    }

    /** Records the original items, values, and order for undo only once. */
    private recordExistingCapabilityGroups(): void {
        if (this.previousGroups !== null) {
            return;
        }

        this.previousGroups = [...this.context.activeEditor.file.capabilityGroups.value.values()].map(
            item => ({
                item,
                id: item.getAsString("id"),
                name: item.getAsString("name"),
            })
        );

        const file = this.context.activeEditor.file;
        this.previousFilters = [...(this.context.activeEditor.view.filterSets.get(
            MappingObjectDiscriminator.CapabilityGroup
        )?.appliedFilters ?? [])];
        this.previousAssignments = [
            file.mappingObjectTemplate,
            ...file.mappingObjects.values(),
        ].map(({ capabilityGroup: prop }) => ({
            prop,
            value: prop.value,
            cached: prop.isValueCached(),
            exportValue: prop.exportValue,
            exportText: prop.exportText,
        }));
    }

    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        if (this.previousGroups === null) {
            return;
        }

        this.restoreGroups(this.previousGroups);

        // Restore selections only after their original options exist again.
        for (const saved of this.previousAssignments) {
            if (saved.cached) {
                saved.prop.cacheValue(saved.exportValue!, saved.exportText!);
            } else {
                saved.prop.value = saved.value;
            }
        }

        const filters = this.context.activeEditor.view.filterSets.get(MappingObjectDiscriminator.CapabilityGroup);
        filters?.showAll();
        for (const id of this.previousFilters) {
            filters?.show(id);
        }
        this.refreshView(issueDirective);
    }

    private refreshView(issueDirective: DirectiveIssuer): void {
        const editor = this.context.activeEditor;
        const groups = editor.file.capabilityGroups;
        // Rebuilding reuses sections, so refresh labels on surviving groups.
        for (const section of editor.view.getItems()) {
            if (section instanceof CapabilityGroupSectionView && section.value !== null) {
                const item = groups.value.get(section.value);
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
