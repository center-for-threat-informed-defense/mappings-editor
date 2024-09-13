import { EditorCommand } from "../EditorCommand";
import { MappingFileViewItem, MappingFileView } from "../..";

export class MoveCameraToViewItem extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    /**
     * The view item's id.
     */
    public readonly id: string;

    /**
     * The camera's position upon execute.
     */
    public readonly execPosition: CameraPosition | undefined;

    /**
     * The camera's position upon undo.
     */
    public readonly undoPosition: CameraPosition | undefined;

    /**
     * The camera's position upon redo.
     */
    public readonly redoPosition: CameraPosition | undefined;


    /**
     * Moves the camera to a {@link MappingFileViewItem}. This command
     * allows you to set the camera position for each command state
     * (i.e. execute, undo, and redo).
     * @param view
     *  The view item.
     * @param execPosition
     *  The camera's position upon execute.
     * @param undoPosition
     *  The camera's position upon undo.
     * @param redoPosition
     *  The camera's position upon redo.
     */
    constructor(
        view: MappingFileViewItem,
        execPosition?: CameraPosition,
        undoPosition?: CameraPosition,
        redoPosition?: CameraPosition
    );

    /**
     * Moves the camera to a {@link MappingFileViewItem}. This command
     * allows you to set the camera position for each command state
     * (i.e. execute, undo, and redo).
     * @param fileView
     *  The mapping file view to operate on.
     * @param id
     *  The view item's id.
     * @param execPosition
     *  The camera's position upon execute.
     * @param undoPosition
     *  The camera's position upon undo.
     * @param redoPosition
     *  The camera's position upon redo.
     */
    constructor(
        fileView: MappingFileView,
        id: string,
        execPosition?: CameraPosition,
        undoPosition?: CameraPosition,
        redoPosition?: CameraPosition
    );
    constructor(
        param1: MappingFileViewItem | MappingFileView,
        param2?: CameraPosition | string,
        param3?: CameraPosition,
        param4?: CameraPosition,
        param5?: CameraPosition
    ) {
        super();
        if(param1 instanceof MappingFileViewItem && typeof param2 !== "string") {
            this.fileView = param1.fileView;
            this.id = param1.id;
            this.execPosition = param2;
            this.undoPosition = param3;
            this.redoPosition = param4 ?? this.execPosition;
        } else if(param1 instanceof MappingFileView && typeof param2 === "string") {
            this.fileView = param1;
            this.id = param2;
            this.execPosition = param3;
            this.undoPosition = param4;
            this.redoPosition = param5 ?? this.execPosition;
        } else {
            throw new Error(`Invalid ${ MoveCameraToViewItem.name } constructor.`);
        }
    }


    /**
     * Executes the editor command.
     */
    public async execute(): Promise<void> {
        this.move(this.execPosition);
    }

    /**
     * Redoes the editor command.
     */
    public async redo(): Promise<void> {
        this.move(this.redoPosition);
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {
        this.move(this.undoPosition);
    }

    /**
     * Executes a move.
     * @param movePosition
     *  The move position.
     */
    private move(movePosition?: CameraPosition) {
        if(movePosition) {
            const { position, positionFromHangers, strict } = movePosition;
            this.fileView.moveToViewItem(this.id, position, positionFromHangers, strict);
        }
    }

}

type CameraPosition = {

    /**
     * The view item's location in the viewport.
     */
    position: number;

    /**
     * If true, the position will be relative to the breakout hangers' base.
     * If false, the position will be relative to the viewport's head.
     */
    positionFromHangers: boolean;

    /**
     * If true, the camera WILL move to the specified viewport position. If
     * false, the camera will only move to the specified viewport position if
     * the item exists outside the current viewport.
     */
    strict: boolean;

}
