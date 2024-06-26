///////////////////////////////////////////////////////////////////////////////
//  1. Context Menu  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export enum MenuType {
    Item    = 0,
    Toggle  = 1,
    Submenu = 2
}

export type ContextMenu
    = ContextMenuItem
    | ContextMenuSubmenu;

export type ContextMenuItem
    = ContextMenuActionItem
    | ContextMenuToggleItem;


///////////////////////////////////////////////////////////////////////////////
//  2. Generic Context Menu  //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


interface ContextMenuBase<T> {
    type: T
    text: string
    disabled?: boolean
}


///////////////////////////////////////////////////////////////////////////////
//  3. Context Menu Section  //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export interface ContextMenuSection {
    id: string,
    items: ContextMenu[]
}


///////////////////////////////////////////////////////////////////////////////
//  4. Context Menu Types  ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export interface ContextMenuActionItem extends ContextMenuBase<MenuType.Item> {
    data: any
    shortcut?: string,
    keepMenuOpenOnSelect?: boolean
}

export interface ContextMenuToggleItem extends ContextMenuBase<MenuType.Toggle> {
    data: any
    value: boolean,
    shortcut?: string,
    keepMenuOpenOnSelect?: boolean
}

export interface ContextMenuSubmenu extends ContextMenuBase<MenuType.Submenu> {
    sections : ContextMenuSection[]
}
