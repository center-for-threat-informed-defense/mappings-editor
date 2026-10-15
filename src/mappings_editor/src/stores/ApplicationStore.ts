import Configuration from "@/assets/configuration/app.config";
import { defineStore } from 'pinia'
import { FileStore } from "@/assets/scripts/Utilities";
import { MappingFileEditor, EditorCommand } from '@/assets/scripts/MappingFileEditor'
import { FrameworkRegistry, FrameworkSourceFile, FrameworksSourceUrl, MappingFileAuthority, type Framework } from '@/assets/scripts/MappingFileAuthority'
import { BaseAppSettings, type AppCommand, MappingFileSerializer } from '@/assets/scripts/Application';
import { MigrationContext } from "@/assets/scripts/MappingFileAuthority/MigrationContext";

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

export enum ModalStackId {
    Splash = 1,
    FileCreation
}

/**
 * A data structure to track which modal should be open when multiple modals
 * can be opened in succession.
 */
class ModalStack {

    private stack : ModalStackId[] = [];

    constructor(initialStack: ModalStackId[]) {
        this.stack = initialStack;
    }

    /** Add the id to the stack if it isn't in there already. */
    public add(modalStackId: ModalStackId): void {
        if (!this.stack.includes(modalStackId)) {
            this.stack.push(modalStackId);
        }
    }

    /** Remove the given id if it is the last element in the stack. */
    public remove(modalStackId: ModalStackId): void {
        if (this.stack.at(-1) == modalStackId) {
            this.stack.pop();
        }
    }

    /** The top element of the stack, i.e. the last in the stack array. */
    public get top() {
        return this.stack.at(-1);
    }
}


// Define Application Store
export const useApplicationStore = defineStore('applicationStore', {
    state: () => ({
        executionCycle: 0,
        activeEditor: MappingFileEditor.Phantom,
        fileAuthority: new MappingFileAuthority(registry),
        fileSerializer: new (Configuration.serializer ?? MappingFileSerializer),
        fileRecoveryBank: new FileStore("file_recovery_bank."),
        frameworkBank: frameworkBank,
        migrationContext: new MigrationContext(),
        settings: BaseAppSettings,
        sidebarViewOptions: sidebarViewOptions,
        activeSidebar: sidebarViewOptions[0],
        modalStack: new ModalStack([ModalStackId.Splash])
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
