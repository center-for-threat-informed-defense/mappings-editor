import * as AppCommands from "@/assets/scripts/Application/Commands";
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands"
import { defineStore } from 'pinia'
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import { useApplicationStore } from './ApplicationStore';
import type { Hotkey } from "@/assets/scripts/Utilities";
import type { CommandEmitter } from '@/assets/scripts/Application';

export const useHotkeyStore = defineStore('hotkeyStore', {
    getters: {

        /**
         * Returns the native hotkeys.
         * @returns
         *  The supported native hotkeys.
         */
        nativeHotkeys(): Hotkey<CommandEmitter>[] {
            return [
                {
                    shortcut: "Control+R",
                    repeatable: true,
                    allowBrowserBehavior: true
                },
                {
                    shortcut: "Control+Shift+R",
                    repeatable: true,
                    allowBrowserBehavior: true
                },
                {
                    shortcut: "Meta+R",
                    repeatable: true,
                    allowBrowserBehavior: true
                },
                {
                    shortcut: "Meta+Shift+R",
                    repeatable: true,
                    allowBrowserBehavior: true
                }
            ]
        },

        /**
         * Returns the file hotkeys.
         * @returns
         *  The file hotkeys.
         */
        fileHotkeys(): Hotkey<CommandEmitter>[] {
            const app = useApplicationStore();
            const file = app.settings.hotkeys.file;
            const editor = app.activeEditor;
            return [
                {
                    data: () => AppCommands.loadFileFromFileSystem(app),
                    shortcut: file.open_file,
                    repeatable: false
                },
                {
                    data: () => AppCommands.saveActiveFileToDevice(app),
                    shortcut: file.save_file,
                    repeatable: false,
                    disabled: editor.id === MappingFileEditor.Phantom.id
                }
            ];
        },

        /**
         * Returns the edit hotkeys.
         * @returns
         *  The edit hotkeys.
         */
        editHotKeys(): Hotkey<CommandEmitter>[] {
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor as MappingFileEditor;
            return [
                {
                    data: () => AppCommands.undoEditorCommand(editor),
                    shortcut: edit.undo,
                    repeatable: true
                },
                {
                    data: () => AppCommands.redoEditorCommand(editor),
                    shortcut: edit.redo,
                    repeatable: true
                },
                {
                    data: () => EditorCommands.deleteSelectedMappingObjectViews(editor.view),
                    shortcut: edit.delete,
                    repeatable: false,
                    disabled: !app.hasSelection
                },
                {
                    data: () => EditorCommands.selectAllMappingObjectViews(editor.view),
                    repeatable: false,
                    shortcut: edit.select_all
                },
                {
                    data: () => EditorCommands.unselectAllMappingObjectViews(editor.view),
                    shortcut: edit.unselect_all,
                    repeatable: false,
                    disabled: !app.hasSelection
                },
                {
                    data: () => AppCommands.cutEditorCommand(app, editor, editor.view),
                    shortcut: edit.cut,
                    repeatable: false,
                    disabled: !app.hasSelection
                },
                {
                    data: () => AppCommands.copySelectedMappingObjects(app, editor.view),
                    shortcut: edit.copy,
                    repeatable: false,
                    disabled: !app.hasSelection
                },
                {
                    data: () => AppCommands.pasteMappingObjects(app, editor),
                    shortcut: edit.paste,
                    repeatable: true
                }
            ];
        },

        /**
         * Returns the layout hotkeys.
         * @returns
         *  The layout hotkeys.
         */
        layoutHotkeys(): Hotkey<CommandEmitter>[] {
            return [];
        },

        /**
         * Returns the view hotkeys.
         * @returns
         *  The view hotkeys.
         */
        viewHotkeys(): Hotkey<CommandEmitter>[] {
            const app = useApplicationStore();
            const view = app.settings.hotkeys.view;
            return  [
                {
                    data: () => AppCommands.switchToFullscreen(),
                    shortcut: view.fullscreen,
                    repeatable: false
                }
            ];
        }

    }
})
