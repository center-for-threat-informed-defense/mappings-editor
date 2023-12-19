import { ShowAllItems } from "./ShowAllItems";
import { MoveBreakout } from "./MoveBreakout";
import { SetFilterState } from "./SetFilterState";
import { SelectViewItem } from "./SelectViewItem";
import { CollapseViewItem } from "./CollapseViewItem";
import { SetBreakoutState } from "./SetBreakoutState";
import { UnselectViewItem } from "./UnselectViewItem";
import { UncollapseViewItem } from "./UncollapseViewItem";
import { SetEditorViewHeight } from "./SetEditorViewHeight";
import { UnselectAllViewItems } from "./UnselectAllViewItems";
import { SetEditorViewPosition } from "./SetEditorViewPosition";
import { DeleteMappingObjectView } from "./DeleteMappingObjectView";
import { CreateMappingObjectView } from "./CreateMappingObjectView";
import { AlterMappingObjectViewProperty } from "./AlterMappingObjectViewProperty";
import type { EditorCommand } from "..";
import { FilterControl, type BreakoutControl, type MappingFileEditor, type MappingFileViewItem, type MappingObjectView } from "../..";


///////////////////////////////////////////////////////////////////////////////
//  1. Editor View  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Sets a {@link MappingFileEditor}'s view height.
 * @param editor
 *  The editor to operate on.
 * @param height
 *  The view's height (in pixels).
 * @returns
 *  A command that represents the action.
 */ 
export function setEditorViewHeight(editor: MappingFileEditor, height: number): EditorCommand {
    return new SetEditorViewHeight(editor, height);
}

/**
 * Sets a {@link MappingFileEditor}'s view position.
 * @param editor
 *  The editor to operate on.
 * @param height
 *  The view's position (in pixels).
 * @returns
 *  A command that represents the action.
 */ 
export function setEditorViewPosition(editor: MappingFileEditor, position: number): EditorCommand {
    return new SetEditorViewPosition(editor, position);
}


///////////////////////////////////////////////////////////////////////////////
//  2. View Selection  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Selects a {@link MappingFileViewItem}.
 * @param item
 *  The view item to select.
 * @returns
 *  A command that represents the action.
 */
export function selectViewItem(item: MappingFileViewItem) {
    return new SelectViewItem(item);
}

/**
 * Unselects a {@link MappingFileViewItem}.
 * @param item
 *  The view item to unselect.
 * @returns
 *  A command that represents the action.
 */
export function unselectViewItem(item: MappingFileViewItem) {
    return new UnselectViewItem(item);
}

/**
 * Unselects all items within a {@link MappingFileEditor}.
 * @param editor
 *  The {@link MappingFileEditor}.
 * @returns
 *  A command that represents the action.
 */
export function unselectAllViewItems(editor: MappingFileEditor) {
    return new UnselectAllViewItems(editor);
}


///////////////////////////////////////////////////////////////////////////////
//  3. View Collapse  /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Collapses a {@link MappingFileViewItem}.
 * @param item
 *  The view item to collapse.
 * @returns
 *  A command that represents the action.
 */
export function collapseViewItem(item: MappingFileViewItem) {
    return new CollapseViewItem(item);
}

/**
 * Uncollapses a {@link MappingFileViewItem}.
 * @param item
 *  The view item to uncollapse.
 * @returns
 *  A command that represents the action.
 */
export function uncollapseViewItem(item: MappingFileViewItem) {
    return new UncollapseViewItem(item);
}


///////////////////////////////////////////////////////////////////////////////
//  4. Create & Destroy View  /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Creates a new {@link MappingObjectView}.
 * @param source
 *  The view item the new object should be created under.
 * @returns
 *  A command that represents the action.
 */
export function createMappingObjectView(view: MappingFileViewItem): EditorCommand {
    return new CreateMappingObjectView(view); 
}

/**
 * Removes a {@link MappingObjectView} from its parent {@link MappingObjectFile}.
 * @param view
 *  The mapping object view to remove.
 * @returns
 *  A command that represents the action.
 */
export function deleteMappingObjectView(view: MappingObjectView): EditorCommand {
    return new DeleteMappingObjectView(view); 
}


///////////////////////////////////////////////////////////////////////////////
//  5. Alter View  ////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Alters a {@link MappingObjectView}'s property.
 * @param view
 *  The mapping object view to manipulate.
 * @param command
 *  The {@link EditorCommand} that alters the underlying
 *  {@link MappingObject}.
 * @returns
 *  A command that represents the action.
 */
export function alterMappingObjectViewProperty(view: MappingObjectView, command: EditorCommand): EditorCommand {
    return new AlterMappingObjectViewProperty(view, command); 
}


///////////////////////////////////////////////////////////////////////////////
//  6. Breakouts  /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Enables a breakout.
 * @param control
 *  The breakout control.
 * @param id
 *  The breakout id.
 * @returns
 *  A command that represents the action.
 */
export function enableBreakout(control: BreakoutControl, id: number): EditorCommand {
    return new SetBreakoutState(control, id, true);
}

/**
 * Disables a breakout.
 * @param control
 *  The breakout control.
 * @param id
 *  The breakout id.
 * @returns
 *  A command that represents the action.
 */
export function disableBreakout(control: BreakoutControl, id: number): EditorCommand {
    return new SetBreakoutState(control, id, false);
}

/**
 * Moves a breakout.
 * @param control
 *  The breakout control.
 * @param id
 *  The breakout id.
 * @param dst
 *  The destination index.
 * @returns
 *  A command that represents the action.
 */
export function moveBreakout(control: BreakoutControl, id: number, dst: number): EditorCommand {
    return new MoveBreakout(control, id, dst);
}


///////////////////////////////////////////////////////////////////////////////
//  7. Filters  ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Applies a filter.
 * @param control
 *  The filter control.
 * @param id
 *  The filter's id.
 * @returns
 *  A command that represents the action.
 */
export function applyFilter(control: FilterControl, id: string | null): EditorCommand {
    return new SetFilterState(control, id, true);
}

/**
 * Removes a filter.
 * @param control
 *  The filter control.
 * @param id
 *  The filter's id.
 * @returns
 *  A command that represents the action.
 */
export function removeFilter(control: FilterControl, id: string | null): EditorCommand {
    return new SetFilterState(control, id, false);
}

/**
 * Shows all items under a filter.
 * @param control
 *  The filter control.
 */
export function showAllItems(control: FilterControl): EditorCommand {
    return new ShowAllItems(control);
}
