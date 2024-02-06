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
        layout: {
        },
        view: {
            fullscreen: ""
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
        layout: LayoutHotkeys,
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
 * Layout hotkeys
 */
export type LayoutHotkeys = {
}

/**
 * View hotkeys
 */
export type ViewHotkeys = {
    fullscreen: string
}
