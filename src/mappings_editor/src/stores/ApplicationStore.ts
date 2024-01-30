import Configuration from "@/assets/configuration/app.config";
import { defineStore } from 'pinia'
import { FileRecoveryBank } from "@/assets/scripts/Utilities";
import { MappingFileEditor, EditorCommand } from '@/assets/scripts/MappingFileEditor'
import { FrameworkRegistry, FrameworksSourceUrl, MappingFileAuthority } from '@/assets/scripts/MappingFileAuthority'
import { BaseAppSettings, type AppCommand, MappingFileSerializer } from '@/assets/scripts/Application';

// Build Framework Registry
const registry = new FrameworkRegistry();
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

// Define Application Store
export const useApplicationStore = defineStore('applicationStore', {
    state: () => ({
        activeEditor: MappingFileEditor.Phantom,
        fileAuthority: new MappingFileAuthority(registry),
        fileSerializer: new (Configuration.serializer ?? MappingFileSerializer),
        fileRecoveryBank: new FileRecoveryBank(),
        settings: BaseAppSettings
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
        execute(command: AppCommand | EditorCommand) {
            if(command instanceof EditorCommand) {
                // Execute editor command
                this.activeEditor.execute(command);
            } else {
                // Execute application command
                command.execute();
            }
            // Temporarily hold any autosaving
            this.activeEditor.tryDelayAutosave();
        }

    }
});

// Define Application Store Type
export type ApplicationStore = ReturnType<typeof useApplicationStore>;
