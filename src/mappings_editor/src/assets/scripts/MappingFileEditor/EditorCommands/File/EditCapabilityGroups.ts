import type { ApplicationStore } from "@/stores/ApplicationStore";
import { StringProperty, type ListItem, type ListItemProperty } from "@/assets/scripts/MappingFile";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import { EditorCommand } from "../EditorCommand";
import { EditorDirective } from "../EditorDirective";
import { CapabilityGroupSectionView } from "../../MappingFileView/MappingFileViewItem/CapabilityGroupSectionView";


export class EditCapabilityGroups extends EditorCommand {
    private context: ApplicationStore
    private previousGroups: { item: ListItem; id: string; name: string }[] | null = null;
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
            return;
        }
        this.recordExistingCapabilityGroups();
        console.log('TODO: Use this', editedGroups);
        // this.context.activeEditor.file.capabilityGroups.
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

        const editor = this.context.activeEditor;
        const groups = editor.file.capabilityGroups;

        for (const item of [...groups.value.values()]) {
            groups.removeListItem(item);
        }
        for (const { item, id, name } of this.previousGroups) {
            (item.get("id") as StringProperty).value = id;
            (item.get("name") as StringProperty).value = name;
            groups.insertListItem(item);
        }

        // Restore selections only after their original options exist again.
        for (const saved of this.previousAssignments) {
            if (saved.cached) {
                saved.prop.cacheValue(saved.exportValue!, saved.exportText!);
            } else {
                saved.prop.value = saved.value;
            }
        }

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
