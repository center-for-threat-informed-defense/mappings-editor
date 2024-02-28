import Package from "@/../package.json";
import Configuration from "@/assets/configuration/app.config";
import * as AppCommands from "@/assets/scripts/Application/Commands";
import * as EditorCommands from "@/assets/scripts/MappingFileEditor/EditorCommands"
import { MenuType } from '@/assets/scripts/Application';
import { defineStore } from 'pinia'
import { MappingFileEditor } from "@/assets/scripts/MappingFileEditor";
import { useApplicationStore } from './ApplicationStore';
import type { ContextMenu, ContextMenuSection, ContextMenuSubmenu } from '@/assets/scripts/Application';

export const useContextMenuStore = defineStore('contextMenuStore', {
    getters: {


        ///////////////////////////////////////////////////////////////////////
        //  1. File Menu  /////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the file menu.
         * @returns
         *  The file menu.
         */
        fileMenu(): ContextMenuSubmenu {
            // Sections
            const sections: ContextMenuSection[] = [
                this.openFileMenu,
                this.isRecoverFileMenuShown ? this.recoverFileMenu : null,
                this.exportFileMenu,
                this.saveFileMenu
            ].filter(Boolean) as ContextMenuSection[];
            // Menu
            return { text: "File", type: MenuType.Submenu, sections };
        },

        /**
         * Returns the 'open file' menu section.
         * @returns
         *  The 'open file' menu section.
         */
        openFileMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const file = app.settings.hotkeys.file;
            const editor = app.activeEditor;
            return {
                id: "open_file_options",
                items: [
                    {
                        text: `Open ${ Configuration.file_type_name }...`,
                        type: MenuType.Item,
                        data: () => AppCommands.loadFileFromFileSystem(app),
                        shortcut: file.open_file
                    },
                    {
                        text: `Import ${ Configuration.file_type_name }s...`,
                        type: MenuType.Item,
                        data: () => AppCommands.importFileFromFileSystem(app),
                        shortcut: file.import_file,
                        disabled: editor.id === MappingFileEditor.Phantom.id
                    }
                ],
            }
        },
        
        /**
         * Returns the 'export file' menu section.
         * @returns
         *  The 'export file' menu section.
         */
        exportFileMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const editor = app.activeEditor as MappingFileEditor;
            const ExportType = AppCommands.ExportType;

            // Determine ATT&CK Navigator Layer support
            const { frameworks_with_navigator_support: navigatorSupport } = Configuration;
            const canExportNavigatorLayer = navigatorSupport.has(editor.file.targetFramework);

            // Build options
            const exportAsOptions: ContextMenuSection = { 
                id: "export_as_options",
                items: [
                    {
                        text: "CSV File...",
                        type: MenuType.Item,
                        data: () => AppCommands.exportActiveFileToDevice(app, ExportType.CSV),
                        disabled: editor.id === MappingFileEditor.Phantom.id
                    },
                    {
                        text: "YAML File...",
                        type: MenuType.Item,
                        data: () => AppCommands.exportActiveFileToDevice(app, ExportType.YAML),
                        disabled: editor.id === MappingFileEditor.Phantom.id
                    },
                    {
                        text: "Excel File...",
                        type: MenuType.Item,
                        data: () => AppCommands.exportActiveFileToDevice(app, ExportType.XLSX),
                        disabled: editor.id === MappingFileEditor.Phantom.id
                    },
                    {
                        text: "ATT&CK Navigator Layer...",
                        type: MenuType.Item,
                        data: () => AppCommands.exportActiveFileToDevice(app, ExportType.NAVIGATOR),
                        disabled: !canExportNavigatorLayer
                    }
                ]
            }

            // Return menu
            return { 
                id: "export_as",
                items: [ {
                    text: "Export As",
                    type: MenuType.Submenu,
                    sections: [ exportAsOptions ]
                } ]
            };

        },

        /**
         * Returns the 'recover file' menu section.
         * @returns
         *  The 'recover file' menu section.
         */
        recoverFileMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const files = app.fileRecoveryBank.files;
            
            // Build file list
            const items: ContextMenu[] = [];
            for(const [id, { name, date, contents }] of files) {
                // Ignore active file
                if(id === app.activeEditor.id) {
                    continue;
                }
                // Add file
                items.push({
                    text: `${ name } (${ date.toLocaleString() })`,
                    type: MenuType.Item,
                    data: () => AppCommands.loadExistingFile(app, contents, name, id)
                })
            }
            if(items.length === 0) {
                items.push({
                    text: "No Recovered Files",
                    type: MenuType.Item,
                    data: () => AppCommands.doNothing(),
                    disabled: true
                });
            }

            // Build submenu
            const submenu: ContextMenu = {
                text: "Open Recovered Files",
                type: MenuType.Submenu,
                sections: [
                    { 
                        id: "recovered_files",
                        items
                    },
                    {
                        id: "bank_controls",
                        items: [{
                            text: "Delete Recovered Files",
                            type: MenuType.Item,
                            data: () => AppCommands.clearFileRecoveryBank(app)
                        }]
                    }
                ]
            }

            // Return menu
            return { 
                id: "recover_file_options",
                items: [ submenu ]
            };

        },

        /**
         * Returns the 'save file' menu section.
         * @returns
         *  The 'save file' menu section.
         */
        saveFileMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const file = app.settings.hotkeys.file;
            const editor = app.activeEditor;
            return {
                id: "save_file_options",
                items: [
                    {
                        text: "Save",
                        type: MenuType.Item,
                        data: () => AppCommands.saveActiveFileToDevice(app),
                        shortcut: file.save_file,
                        disabled: editor.id === MappingFileEditor.Phantom.id
                    }
                ]
            }
        },

        /**
         * Tests if the 'recovery file' menu should be displayed.
         * @returns
         *  True if the menu should be displayed, false otherwise.
         */
        isRecoverFileMenuShown(): boolean {
            const app = useApplicationStore();
            const editor = app.activeEditor;
            const ids = [...app.fileRecoveryBank.files.keys()];
            return (ids.length === 1 && ids[0] !== editor.id) || 1 < ids.length;
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  2. Edit Menus  ////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the edit menu.
         * @returns
         *  The edit menu.
         */
        editMenu(): ContextMenuSubmenu {
            return {
                text: "Edit",
                type: MenuType.Submenu,
                sections: [
                    this.undoRedoMenu,
                    this.clipboardMenu,
                    this.deleteMappingMenu,
                    this.selectMappingMenu
                ]
            }
        },

        /**
         * Returns the undo/redo menu section.
         * @returns
         *  The undo/redo menu section.
         */
        undoRedoMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor as MappingFileEditor;
            return {
                id: "undo_redo_options",
                items: [
                    {
                        text: "Undo",
                        type: MenuType.Item,
                        data: () => AppCommands.undoEditorCommand(editor),
                        shortcut: edit.undo,
                        disabled: !app.canUndo
                    },
                    {
                        text: "Redo",
                        type: MenuType.Item,
                        data: () => AppCommands.redoEditorCommand(editor),
                        shortcut: edit.redo,
                        disabled: !app.canRedo
                    }
                ],
            }
        },

        /**
         * Returns the clipboard menu section.
         * @returns
         *  The clipboard menu section.
         */
        clipboardMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor as MappingFileEditor;
            return {
                id: "clipboard_options",
                items: [
                    {
                        text: "Cut",
                        type: MenuType.Item,
                        data: () => AppCommands.cutEditorCommand(app, editor, editor.view),
                        shortcut: edit.cut,
                        disabled: !app.hasSelection
                    },
                    {
                        text: "Copy",
                        type: MenuType.Item,
                        data: () => AppCommands.copySelectedMappingObjects(app, editor.view),
                        shortcut: edit.copy,
                        disabled: !app.hasSelection
                    },
                    {
                        text: "Paste",
                        type: MenuType.Item,
                        data: () => AppCommands.pasteMappingObjects(app, editor),
                        shortcut: edit.paste
                    }
                ],
            }
        },

        /**
         * Returns the delete mapping menu section.
         * @returns
         *  The delete mapping menu section.
         */
        deleteMappingMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor as MappingFileEditor;
            return {
                id: "delete_mapping",
                items: [
                    {
                        text: "Delete",
                        type: MenuType.Item,
                        data: () => EditorCommands.deleteSelectedMappingObjectViews(editor.view),
                        shortcut: edit.delete,
                        disabled: !app.hasSelection
                    }
                ],
            }
        },

        /**
         * Returns the select mapping menu section.
         * @returns
         *  The select mapping menu section.
         */
        selectMappingMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const edit = app.settings.hotkeys.edit;
            const editor = app.activeEditor as MappingFileEditor;
            return {
                id: "select_mapping",
                items: [
                    {
                        text: "Select All",
                        type: MenuType.Item,
                        data: () => EditorCommands.selectAllMappingObjectViews(editor.view),
                        shortcut: edit.select_all
                    },
                    {
                        text: "Unselect All",
                        type: MenuType.Item,
                        data: () => EditorCommands.unselectAllMappingObjectViews(editor.view),
                        shortcut: edit.unselect_all,
                        disabled: !app.hasSelection
                    }
                ],
            }
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  3. View Menus  ////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the view menu.
         * @returns
         *  The view menu.
         */
        viewMenu(): ContextMenuSubmenu {
            return {
                text: "View",
                type: MenuType.Submenu,
                sections: [
                    this.collapseMappingsMenu,
                    this.fullscreenMenu
                ]
            }
        },

        /**
         * Returns the collapse mappings menu section.
         * @returns
         *  The collapse mappings menu section.
         */
        collapseMappingsMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const view = app.settings.hotkeys.view;
            const editor = app.activeEditor as MappingFileEditor;
            return {
                id: "collapse_mappings",
                items: [
                    {
                        text: "Collapse All Mappings",
                        type: MenuType.Item,
                        data: () => EditorCommands.collapseAllMappingObjectViews(editor.view),
                        shortcut: view.collapse_all_mappings,
                        disabled: editor.id === MappingFileEditor.Phantom.id
                    },
                    {
                        text: "Uncollapse All Mappings",
                        type: MenuType.Item,
                        data: () => EditorCommands.uncollapseAllMappingObjectViews(editor.view),
                        shortcut: view.uncollapse_all_mappings,
                        disabled: editor.id === MappingFileEditor.Phantom.id
                    }
                ],
            }
        },

        /**
         * Returns the fullscreen menu section.
         * @returns
         *  The fullscreen menu section.
         */
        fullscreenMenu(): ContextMenuSection {
            const app = useApplicationStore();
            const view = app.settings.hotkeys.view;
            return {
                id: "fullscreen_options",
                items: [
                    {
                        text: "Fullscreen",
                        type: MenuType.Item,
                        data: () => AppCommands.switchToFullscreen(),
                        shortcut: view.fullscreen,
                    }
                ],
            };
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  4. Help Menu  /////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the help menu.
         * @returns
         *  The help menu.
         */
        helpMenu(): ContextMenuSubmenu {
            const links = Configuration.menus.help_menu.help_links;
            // Links
            const items: ContextMenu[] = links.map(link => ({
                text: link.text,
                type: MenuType.Item,
                data: () => AppCommands.openHyperlink(link.url)
            }));
            // Menu
            return {
                text: "Help",
                type: MenuType.Submenu,
                sections: [
                    { id: "help_links", items },
                    { 
                        id: "version",
                        items: [
                            {
                                text: `Mapping Editor v${ Package.version }`,
                                type: MenuType.Item,
                                data: () => {},
                                disabled: true
                            }
                        ]
                    }
                ]
            };
        }

    }
})
