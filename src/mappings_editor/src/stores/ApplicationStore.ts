import Configuration from "@/assets/configuration/app.config";
import { defineStore } from 'pinia'
import { FileStore } from "@/assets/scripts/Utilities";
import { MappingFileEditor, EditorCommand } from '@/assets/scripts/MappingFileEditor'
import { FrameworkRegistry, FrameworkSourceFile, FrameworksSourceUrl, MappingFileAuthority, type Framework } from '@/assets/scripts/MappingFileAuthority'
import { BaseAppSettings, type AppCommand, MappingFileSerializer } from '@/assets/scripts/Application';

// Build Framework Registry
const registry = new FrameworkRegistry();
// Load native frameworks
const manifest = Configuration.native_frameworks_manifest;
for(const file of manifest.files) {
    registry.registerFramework(
        new FrameworksSourceUrl(
            file.frameworkId,
            file.frameworkVersion,
            `${ manifest.path }/${ file.filename }`
        )
    )
}
// Load stored frameworks
const frameworkBank = new FileStore("framework_bank.");
for(const file of frameworkBank.files.values()) {
    const framework = JSON.parse(file.contents) as Framework;
    registry.registerFramework(
        new FrameworkSourceFile(framework)
    )
}

// Define sidebar options for side view pane
type SidebarView = {
    id: string;
    label: string;
    icon: string;
    pane: string;
}

const sidebarViewOptions: SidebarView[] = [
    {
        id: "filter",
        label: "View and Organize Mappings",
        icon: "ListMappings",
        pane: "ViewFilterSidebar",
    },
    {
        id: "issues",
        label: "Resolve Problems",
        icon: "AlertIcon",
        pane: "ProblemPane",
    }
];


// Define Application Store
export const useApplicationStore = defineStore('applicationStore', {
    state: () => ({
        executionCycle: 0,
        activeEditor: MappingFileEditor.Phantom,
        fileAuthority: new MappingFileAuthority(registry),
        fileSerializer: new (Configuration.serializer ?? MappingFileSerializer),
        fileRecoveryBank: new FileStore("file_recovery_bank."),
        frameworkBank: frameworkBank,
        settings: BaseAppSettings,
        sidebarViewOptions: sidebarViewOptions,
        activeSidebar: sidebarViewOptions[0],
    }),
    getters: {

        /**
         * Tests if the last command on the active page can be undone.
         * @returns
         *  True if the last command can be undone, false otherwise.
         */
        canUndo(state): boolean {
            return state.activeEditor.canUndo();
        },

        /**
         * Tests if the last undone command on the active page can be redone.
         * @returns
         *  True if the last undone command can be redone, false otherwise.
         */
        canRedo(state): boolean {
            return state.activeEditor.canRedo();
        },

        /**
         * Tests if the active editor has a selection.
         * @returns
         *  True if the active editor has a selection, false otherwise.
         */
        hasSelection(state): boolean {
            return 0 < state.activeEditor.view.selected.size;
        }
    },
    actions: {

        /**
         * Executes an application command.
         * @param command
         *  The application command.
         */
        async execute(command: AppCommand | EditorCommand) {
            // Update execution cycle
            this.executionCycle++;
            // Execute command
            if(command instanceof EditorCommand) {
                // Execute editor command
                await this.activeEditor.execute(command);
            } else {
                // Execute application command
                await command.execute();
            }
            // Temporarily hold any autosaving
            this.activeEditor.tryDelayAutosave();
        },
        /**
         * Updates the active sidebar
         * @param newActiveOption
         *  The new active section to set in the app store.
         */
        setActiveSidebar(newActiveOption: SidebarView) {
            this.activeSidebar = newActiveOption;
        }


    }
});

// Define Application Store Type
export type ApplicationStore = ReturnType<typeof useApplicationStore>;
