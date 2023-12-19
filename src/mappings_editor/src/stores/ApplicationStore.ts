import Configuration from "@/assets/configuration/app.config";
import { toRaw } from "vue";
import { defineStore } from 'pinia'
import { SaveMappingFileToDevice } from "@/assets/scripts/Application/Commands/FileManagement/SaveMappingFileToDevice";
import { AutosaveTimer, FileRecoveryBank } from "@/assets/scripts/Utilities";
import { MappingFileEditor, EditorCommand, EditorDirectives } from '@/assets/scripts/MappingFileEditor'
import { FrameworkRegistry, FrameworksSourceUrl, MappingFileAuthority } from '@/assets/scripts/MappingFileAuthority'
import { BaseAppSettings, type AppCommand, MappingFileSerializer } from '@/assets/scripts/Application';
import type { MappingFile } from "@/assets/scripts/MappingFile";

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
        autosaveTimer: new AutosaveTimer<MappingFileEditor>(1500),
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
        }

    },
    actions: {

        /**
         * Executes an application command.
         * @param command
         *  The application command.
         */
        execute(command: AppCommand | EditorCommand) {
            /**
             * TODO:
             *  - Make MappingFileEditor extend EventEmitter
             *  - Create 'autosave' event that provides MappingFile
             *  - Subscribe 'autosaveEditor' to 'autosave' event in LoadFile()
             *  - Move AutosaveTimer into MappingFileEditor
             *  - MappingFileEditor should provide delayAutosave() and cancelAutosave() functions
             *  - This will allow us to capture 'undo' and 'redo' commands in autosave
             * 
             * This keeps FullRecord directives contained inside
             * MappingFileEditor library while keeping the actual autosave
             * logic outside of the library.
             */
            if(command instanceof EditorCommand) {
                // Execute editor command
                const directives = this.activeEditor.execute(command);
                // If any commands were recorded to the page's undo
                // history, store all progress in the recovery bank.
                if((directives & EditorDirectives.FullRecord) === EditorDirectives.FullRecord) {
                    this.autosaveTimer.requestSave(
                        this.activeEditor.id,
                        this.activeEditor as MappingFileEditor,
                        editor => this.autosaveEditor(editor)
                    )
                }
            } else {
                // Execute application command
                command.execute();
                // If mapping file save...
                if(command instanceof SaveMappingFileToDevice) {
                    // ...withdraw file from recovery bank
                    this.autosaveTimer.cancelAutosave(command.id);
                    this.fileRecoveryBank.withdrawFile(command.id);
                }
            }
            // Temporarily hold any autosaving
            this.autosaveTimer.delayAutosave();
        },

        /**
         * Autosaves an editor.
         * @param editor
         *  The editor to autosave.
         */
        autosaveEditor(editor: MappingFileEditor) {
            // Create raw references
            const activeEditor = toRaw(editor);
            const fileAuthority = toRaw(this.fileAuthority);
            const fileSerializer = toRaw(this.fileSerializer);
            // Deconstruct file
            const file = fileAuthority.exportMappingFile(
                activeEditor.file as MappingFile
            );
            // Serialize file
            const contents = fileSerializer.serialize(file);
            // Store file
            this.fileRecoveryBank.storeOrUpdateFile(
                activeEditor.id,
                activeEditor.name,
                contents
            )
        }

    }
});

// Define Application Store Type
export type ApplicationStore = ReturnType<typeof useApplicationStore>;
