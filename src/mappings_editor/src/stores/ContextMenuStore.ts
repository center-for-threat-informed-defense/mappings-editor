import Configuration from "@/assets/configuration/app.config";
import * as AppCommands from "@/assets/scripts/Application/Commands";
import { MenuType } from '@/assets/scripts/Application';
import { defineStore } from 'pinia'
import { MappingFileEditor } from "@/assets/scripts/MappingsFileEditor";
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
                this.saveFileMenu
            ].filter(Boolean);
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
            return {
                id: "open_file_options",
                items: [
                    // {
                    //     text: `New File`,
                    //     type: MenuType.Item,
                    //     data: () => AppCommands.loadPageFromFileSystem(ctx),
                    //     shortcut: file.new_file
                    // },
                    {
                        text: `Open File...`,
                        type: MenuType.Item,
                        data: () => AppCommands.loadPageFromFileSystem(app),
                        shortcut: file.open_file
                    }
                ],
            }
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
                    this.undoRedoMenu
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
            const page = app.activeEditor;
            const edit = app.settings.hotkeys.edit;
            return {
                id: "undo_redo_options",
                items: [
                    // {
                    //     text: "Undo",
                    //     type: MenuType.Item,
                    //     data: () => AppCommands.undoPageCommand(ctx, page),
                    //     shortcut: edit.undo,
                    //     disabled: !app.canUndo
                    // },
                    // {
                    //     text: "Redo",
                    //     type: MenuType.Item,
                    //     data: () => AppCommands.redoPageCommand(ctx, page),
                    //     shortcut: edit.redo,
                    //     disabled: !app.canRedo
                    // }
                ],
            }
        },


        ///////////////////////////////////////////////////////////////////////
        //  3. Layout Menus  //////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////


        /**
         * Returns the layout menu.
         * @returns
         *  The layout menu.
         */
        layoutMenu(): ContextMenuSubmenu {
            return {
                text: "Layout",
                type: MenuType.Submenu,
                sections: []
            };
        },

        
        ///////////////////////////////////////////////////////////////////////
        //  4. View Menus  ////////////////////////////////////////////////////
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
                    this.fullscreenMenu,
                ]
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
        //  5. Help Menu  /////////////////////////////////////////////////////
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
                    { id: "help_links", items }
                ]
            };
        }

    }
})
