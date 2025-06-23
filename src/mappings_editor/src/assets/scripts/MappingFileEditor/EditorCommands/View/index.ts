import { ShowAllItems } from "./ShowAllItems";
import { MoveBreakout } from "./MoveBreakout";
import { EditorCommand } from "..";
import { SetFilterState } from "./SetFilterState";
import { CollapseViewItem } from "./CollapseViewItem";
import { SetBreakoutState } from "./SetBreakoutState";
import { MoveCameraToViewItem } from "./MoveCameraToViewItem";
import { RebuildViewBreakouts } from "./RebuildViewBreakouts";
import { ReindexMappingObjects } from "../File/ReindexMappingObjects";
import { DeleteMappingObjectView } from "./DeleteMappingObjectView";
import { CreateMappingObjectView } from "./CreateMappingObjectView";
import { DeleteMappingObjectViews } from "./DeleteMappingObjectViews";
import { SelectMappingObjectViews } from "./SelectMappingObjectViews";
import { SetMappingFileViewHeight } from "./SetMappingFileViewHeight";
import { SetMappingFileViewPosition } from "./SetMappingFileViewPosition";
import { SelectAllMappingObjectViews } from "./SelectAllMappingObjectViews";
import { CollapseAllMappingObjectViews } from "./CollapseAllMappingObjectViews";
import { MoveSelectedMappingObjectViews } from "./MoveSelectedMappingObjectViews";
import { FilterControl, MappingFileView, GroupCommand } from "../..";
import { MappingObjectView, type BreakoutControl, type MappingFileViewItem} from "../.."


///////////////////////////////////////////////////////////////////////////////
//  1. Editor View  ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Sets a {@link MappingFileView}'s view height.
 * @param fileView
 *  The mapping file view to operate on.
 * @param height
 *  The view's height (in pixels).
 * @returns
 *  A command that represents the action.
 */
export function setMappingFileViewHeight(fileView: MappingFileView, height: number): EditorCommand {
    return new SetMappingFileViewHeight(fileView, height);
}

/**
 * Sets a {@link MappingFileView}'s view position.
 * @param view
 *  The mapping file view to operate on.
 * @param height
 *  The view's position (in pixels).
 * @returns
 *  A command that represents the action.
 */
export function setMappingFileViewPosition(fileView: MappingFileView, position: number): EditorCommand {
    return new SetMappingFileViewPosition(fileView, position);
}

/**
 * Rebuilds a {@link MappingFileView}'s breakouts.
 * @param view
 *  The mapping file view to operate on.
 * @returns
 *  A command that represents the action.
 */
export function rebuildViewBreakouts(fileView: MappingFileView): EditorCommand {
    return new RebuildViewBreakouts(fileView);
}


///////////////////////////////////////////////////////////////////////////////
//  2. View Selection  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Selects a {@link MappingObjectView}.
 * @param view
 *  The mapping object view to select.
 * @returns
 *  A command that represents the action.
 */
export function selectMappingObjectView(view: MappingObjectView) {
    return new SelectMappingObjectViews(view, { select: true, pivot: false });
}

/**
 * Selects one or more {@link MappingObjectView}.
 * @param views
 *  The mapping object views to select.
 * @returns
 *  A command that represents the action.
 */
export function selectMappingObjectViews(views: MappingObjectView[]) {
    return new SelectMappingObjectViews(views, { select: true, pivot: false });
}

/**
 * Selects a {@link MappingObjectView}.
 * @param fileView
 *  The mapping file view to operate on.
 * @returns
 *  A command that represents the action.
 */
export function selectAllMappingObjectViews(fileView: MappingFileView) {
    return new SelectAllMappingObjectViews(fileView, true);
}

/**
 * Unselects a {@link MappingObjectView}.
 * @param item
 *  The view item to unselect.
 * @returns
 *  A command that represents the action.
 */
export function unselectMappingObjectView(item: MappingObjectView) {
    return new SelectMappingObjectViews(item, false);
}

/**
 * Unselects all items within a {@link MappingFileView}.
 * @param fileView
 *  The mapping file view to operate on.
 * @returns
 *  A command that represents the action.
 */
export function unselectAllMappingObjectViews(fileView: MappingFileView) {
    return new SelectAllMappingObjectViews(fileView, false);
}

/**
 * Selects one or more {@link MappingObjectView}s.
 * @param fileView
 *  The mapping file view to operate on,
 * @param ids
 *  The mapping object ids.
 * @returns
 *  A command that represents the action.
 */
export function selectMappingObjectViewsById(fileView: MappingFileView, ids: string[]) {
    return new SelectMappingObjectViews(fileView, ids, { select: true, pivot: false });
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
    return createSplitPhaseViewCommand(
        new CollapseViewItem(item, true),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
}

/**
 * Uncollapses a {@link MappingFileViewItem}.
 * @param item
 *  The view item to uncollapse.
 * @returns
 *  A command that represents the action.
 */
export function uncollapseViewItem(item: MappingFileViewItem) {
    return createSplitPhaseViewCommand(
        new CollapseViewItem(item, false),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
}

/**
 * Collapses all {@link MappingObjectView}.
 * @param fileView
 *  The mapping file view to operate on.
 * @returns
 *  A command that represents the action.
 */
export function collapseAllMappingObjectViews(fileView: MappingFileView) {
    return createSplitPhaseViewCommand(
        new CollapseAllMappingObjectViews(fileView, true),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
}

/**
 * Uncollapses all {@link MappingObjectView}.
 * @param fileView
 *  The mapping file view to operate on.
 * @returns
 *  A command that represents the action.
 */
export function uncollapseAllMappingObjectViews(fileView: MappingFileView) {
    return createSplitPhaseViewCommand(
        new CollapseAllMappingObjectViews(fileView, false),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
}


///////////////////////////////////////////////////////////////////////////////
//  4. Create, Destroy, and Move View  ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Creates a new {@link MappingObjectView}.
 * @param destination
 *  The view item the new object should be created under.
 * @returns
 *  A command that represents the action.
 */
export function createMappingObjectView(destination: MappingFileViewItem): EditorCommand {
    return createSplitPhaseViewCommand(
        new CreateMappingObjectView(destination),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView),
            new SelectMappingObjectViews(cmd.fileView, cmd.object.id, true),
            new MoveCameraToViewItem(cmd.fileView, cmd.object.id, {
                position: 0,
                positionFromHangers: true,
                strict: false
            })
        ]
    );
}

/**
 * Deletes a {@link MappingObjectView} and its underlying {@link MappingObject}
 * from its {@link MappingFile}.
 * @param view
 *  The mapping object view to delete.
 * @returns
 *  A command that represents the action.
 */
export function deleteMappingObjectView(view: MappingObjectView): EditorCommand {
    return createSplitPhaseViewCommand(
        new DeleteMappingObjectView(view),
        cmd => {
            const camera = {
                position: view.headOffset - view.fileView.viewPosition,
                positionFromHangers: false,
                strict: false
            }
            return [
                new RebuildViewBreakouts(cmd.fileView),
                new MoveCameraToViewItem(view, undefined, camera)
            ]
        }
    )
}

/**
 * Deletes multiple {@link MappingObjectView}s and their underlying
 * {@link MappingObject}s from their {@link MappingFile}.
 * @param views
 *  The mapping object views to delete.
 * @returns
 *  A command that represents the action.
 */
export function deleteMappingObjectViews(views: MappingObjectView[]): EditorCommand {
    return createSplitPhaseViewCommand(
        new DeleteMappingObjectViews(views),
        cmd => {
            if(!cmd.views.length) {
                return [];
            }
            const item = cmd.views[0];
            const camera = {
                position: item.headOffset - item.fileView.viewPosition,
                positionFromHangers: false,
                strict: false
            }
            return [
                new RebuildViewBreakouts(item.fileView),
                new MoveCameraToViewItem(item, undefined, camera)
            ]
        }
    )
}

/**
 * Deletes all selected {@link MappingObjectView}s and their underlying
 * {@link MappingObject}s from their {@link MappingFile}.
 * @param fileView
 *  The mapping file view to operate on.
 * @returns
 *  A command that represents the action.
 */
export function deleteSelectedMappingObjectViews(fileView: MappingFileView): EditorCommand {
    return deleteMappingObjectViews([...fileView.getItems(
        o => o instanceof MappingObjectView && o.selected
    )] as MappingObjectView[]);
}

/**
 * Moves multiple {@link MappingObjectView}s under the specified
 * {@link MappingFileViewItem}.
 * @param views
 *  The mapping object views to move.
 * @param destination
 *  The destination object.
 * @param viewPosition
 *  The mapping file's view position at the beginning of the drag movement.
 * @returns
 *  A command that represent the action.
 */
export function moveMappingObjectViews(views: MappingObjectView[], destination: MappingFileViewItem, viewPosition: number): EditorCommand {
    return createSplitPhaseViewCommand(
        new MoveSelectedMappingObjectViews(views, destination),
        cmd => {
            if(!cmd.views.length) {
                return [];
            }
            const item = cmd.views[0];
            const destOffset = destination.headOffset + destination.height + destination.padding;
            const camera1 = {
                position: destOffset - item.fileView.viewPosition,
                positionFromHangers: false,
                strict: true
            }
            const camera2 = {
                position: item.headOffset - viewPosition,
                positionFromHangers: false,
                strict: false
            }
            return [
                new RebuildViewBreakouts(item.fileView),
                new SelectMappingObjectViews(cmd.views, undefined, true, true),
                new MoveCameraToViewItem(item, camera1, camera2)
            ]
        }
    );
}

/**
 * Moves all selected {@link MappingObjectView}s under the specified
 * {@link MappingFileViewItem}.
 * @param fileView
 *  The mapping file view to operate on.
 * @param destination
 *  The destination object.
 * @param viewPosition
 *  The mapping file's view position at the beginning of the drag movement.
 * @returns
 *  A command that represents the action.
 */
export function moveSelectedMappingObjectViews(fileView: MappingFileView, destination: MappingFileViewItem, viewPosition: number) {
    // Collect selection
    const selected =[...fileView.getItems(
        o => o instanceof MappingObjectView && o.selected
    )] as MappingObjectView[];
    // Move selection
    return moveMappingObjectViews(selected, destination, viewPosition);
}


///////////////////////////////////////////////////////////////////////////////
//  5. Set Property  //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Alters a {@link MappingObjectView}'s property.
 * @param view
 *  The mapping object view to manipulate.
 * @param command
 *  The {@link EditorCommand} that alters the underlying
 *  {@link MappingObject}.
 * @param autoScroll
 *  Whether or not to autoscroll (defaults to true)
 * @returns
 *  A command that represents the action.
 */
export function setMappingObjectViewProperty(view: MappingObjectView, command: EditorCommand, autoScroll: boolean = true): EditorCommand {
    return createSplitPhaseViewCommand(
        command,
        () => {
            const camera = {
                position: view.headOffset - view.fileView.viewPosition,
                positionFromHangers: false,
                strict: false
            }
            return [
                new ReindexMappingObjects(view.id),
                new RebuildViewBreakouts(view.fileView),
                new SelectMappingObjectViews(view, undefined, true, true),
                new MoveCameraToViewItem(view, autoScroll ? camera : undefined, camera, camera) // todo: optionally provide this param
            ];
        }
    )
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
    return createSplitPhaseViewCommand(
        new SetBreakoutState(control, id, true),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
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
    return createSplitPhaseViewCommand(
        new SetBreakoutState(control, id, false),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
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
    return createSplitPhaseViewCommand(
        new MoveBreakout(control, id, dst),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
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
    return createSplitPhaseViewCommand(
        new SetFilterState(control, id, true),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
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
    return createSplitPhaseViewCommand(
        new SetFilterState(control, id, false),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
}

/**
 * Shows all items under a filter.
 * @param control
 *  The filter control.
 */
export function showAllItems(control: FilterControl): EditorCommand {
    return createSplitPhaseViewCommand(
        new ShowAllItems(control),
        cmd => [
            new RebuildViewBreakouts(cmd.fileView)
        ]
    );
}


///////////////////////////////////////////////////////////////////////////////
//  8. Camera  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Moves the camera to a {@link MappingFileViewItem}.
 * @param id
 *  The view item's id.
 * @param position
 *  The view item's location in the viewport.
 * @param positionFromHangers
 *  If true, the position will be relative to the breakout hangers' base.
 *  If false, the position will be relative to the viewport's head.
 *  (Default: `false`)
 * @param strict
 *  If true, the camera WILL move to the specified viewport position. If
 *  false, the camera will only move to the specified viewport position if
 *  the item exists outside the current viewport.
 *  (Default: `false`)
 * @returns
 *  A command that represents the action.
 */
export function moveCameraToViewItem(
    view: MappingFileViewItem,
    position: number,
    positionFromHangers: boolean = false,
    strict: boolean = false
): EditorCommand {
    return new MoveCameraToViewItem(view, {
        position,
        positionFromHangers,
        strict
    });
}


///////////////////////////////////////////////////////////////////////////////
//  9. Split Phase View Commands  /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * Creates a split-phase view command.
 * @param phase1
 *  The primary view command.
 * @param phase2
 *  A function which generates the secondary view commands using the primary
 *  view command.
 * @returns
 *  The split-phase view command.
 */
export function createSplitPhaseViewCommand<T extends EditorCommand>(
    phase1: T,
    generatePhase2: (command: T) => EditorCommand[]
): EditorCommand {
    // Construct Phase 2
    const phase2 = new GroupCommand(false, false);
    for(const cmd of generatePhase2(phase1)) {
        phase2.do(cmd);
    }
    // Build split-phase command
    const command = new GroupCommand(false);
    command.do(phase1);
    command.do(phase2);
    // Return command
    return command;
}
