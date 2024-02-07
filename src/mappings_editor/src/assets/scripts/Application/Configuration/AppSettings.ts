/**
 * Base App Settings
 */
export const BaseAppSettings: AppSettings = {
    hotkeys: {
        file: { 
            import_file: "",
            new_file: "",
            open_file: "",
            save_file: ""
        },
        edit: {
            undo: "",
            redo: "",
            paint_select: "",
            multi_select: "",
            delete: "",
            select_all: "",
            unselect_all: "",
            cut: "",
            copy: "",
            paste: ""
        },
        view: {
            collapse_all_mappings: "",
            uncollapse_all_mappings: "",
            fullscreen: "",
        }
    }
}

/**
 * App Settings File
 */
export type AppSettings = {
    hotkeys: {
        file: FileHotkeys,
        edit: EditHotkeys,
        view: ViewHotkeys
    }
}

/**
 * File hotkeys
 */
export type FileHotkeys = { 
    import_file: string,
    new_file: string,
    open_file: string,
    save_file: string
}

/**
 * Edit hotkeys
 */
export type EditHotkeys = {
    undo: string,
    redo: string,
    paint_select: string,
    multi_select: string,
    delete: string,
    select_all: string,
    unselect_all: string,
    cut: string,
    copy: string,
    paste: string,
}

/**
 * View hotkeys
 */
export type ViewHotkeys = {
    collapse_all_mappings: string,
    uncollapse_all_mappings: string,
    fullscreen: string
}
