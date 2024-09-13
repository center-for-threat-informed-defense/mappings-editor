import { EditorCommand, MappingFileView, MappingObjectView } from "../..";

export class SelectMappingObjectViews extends EditorCommand {

    /**
     * The mapping file view or the mapping object views.
     */
    public readonly view: MappingFileView | MappingObjectView[];

    /**
     * The mapping object ids.
     */
    public readonly ids: string[] | undefined;

    /**
     * The item's select state upon execute.
     */
    public readonly execSelect: SelectOptions | boolean | undefined;

    /**
     * The item's select state upon undo.
     */
    public readonly undoSelect: SelectOptions | boolean | undefined;

    /**
     * The item's select state upon redo.
     */
    public readonly redoSelect: SelectOptions | boolean | undefined;


    /**
     * Selects / Unselects a {@link MappingObjectView}. This command allows you
     * to set the select state of a {@link MappingObjectView} for each command
     * state (i.e. execute, undo, and redo).
     * @param view
     *  The mapping object view.
     * @param execSelect
     *  The item's select state upon execute.
     * @param undoSelect
     *  The item's select state upon undo.
     * @param redoSelect
     *  The item's select state upon redo.
     */
    constructor(
        view: MappingObjectView,
        execSelect?: SelectOptions | boolean,
        undoSelect?: SelectOptions | boolean,
        redoSelect?: SelectOptions | boolean
    );

    /**
     * Selects / Unselects one or more {@link MappingObjectView}s. This command
     * allows you to set the select state of a {@link MappingObjectView} for
     * each command state (i.e. execute, undo, and redo).
     * @param views
     *  The mapping object views.
     * @param execSelect
     *  The item's select state upon execute.
     * @param undoSelect
     *  The item's select state upon undo.
     * @param redoSelect
     *  The item's select state upon redo.
     */
    constructor(
        views: MappingObjectView[],
        execSelect?: SelectOptions | boolean,
        undoSelect?: SelectOptions | boolean,
        redoSelect?: SelectOptions | boolean
    );

    /**
     * Selects / Unselects a {@link MappingObjectView}. This command allows you
     * to set the select state of a {@link MappingObjectView} for each command
     * state (i.e. execute, undo, and redo).
     * @param fileView
     *  The mapping file view to operate on.
     * @param id
     *  The mapping object's id.
     * @param execSelect
     *  The item's select state upon execute.
     * @param undoSelect
     *  The item's select state upon undo.
     * @param redoSelect
     *  The item's select state upon redo.
     */
    constructor(
        fileView: MappingFileView,
        id: string,
        execSelect?: SelectOptions | boolean,
        undoSelect?: SelectOptions | boolean,
        redoSelect?: SelectOptions | boolean
    );

    /**
     * Selects / Unselects one or more {@link MappingObjectView}s. This command
     * allows you to set the select state of a {@link MappingObjectView} for
     * each command state (i.e. execute, undo, and redo).
     * @param fileView
     *  The mapping file view to operate on.
     * @param ids
     *  The mapping object ids.
     * @param execSelect
     *  The item's select state upon execute.
     * @param undoSelect
     *  The item's select state upon undo.
     * @param redoSelect
     *  The item's select state upon redo.
     */
    constructor(
        fileView: MappingFileView,
        ids: string[],
        execSelect?: SelectOptions | boolean,
        undoSelect?: SelectOptions | boolean,
        redoSelect?: SelectOptions | boolean
    );
    constructor(
        param1: MappingFileView | MappingObjectView[] | MappingObjectView,
        param2?: SelectOptions | boolean | string[] | string,
        param3?: SelectOptions | boolean,
        param4?: SelectOptions | boolean,
        param5?: SelectOptions | boolean
    ) {
        super();
        // Signature 1
        if(param1 instanceof MappingObjectView) {
            this.view = [param1];
            this.execSelect = param2 as SelectOptions | boolean;
            this.undoSelect = param3;
            this.redoSelect = param4 ?? this.execSelect;
        }
        // Signature 2
        else if(Array.isArray(param1)) {
            this.view = param1;
            this.execSelect = param2 as SelectOptions | boolean;
            this.undoSelect = param3;
            this.redoSelect = param4 ?? this.execSelect;
        }
        // Signature 3
        else if(
            param1 instanceof MappingFileView &&
            Array.isArray(param2)
        ) {
            this.view = param1;
            this.ids = param2;
            this.execSelect = param3;
            this.undoSelect = param4;
            this.redoSelect = param5 ?? this.execSelect;
        }
        // Signature 4
        else if(
            param1 instanceof MappingFileView &&
            typeof param2 === "string"
        ) {
            this.view = param1;
            this.ids = [param2]
            this.execSelect = param3;
            this.undoSelect = param4;
            this.redoSelect = param5 ?? this.execSelect;
        } else {
            throw new Error(`Invalid ${ SelectMappingObjectViews.name } constructor.`);
        }
    }


    /**
     * Executes the editor command.
     */
    public async execute(): Promise<void> {
        this.select(this.execSelect);
    }

    /**
     * Redoes the editor command.
     */
    public async redo(): Promise<void> {
        this.select(this.redoSelect);
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {
        this.select(this.undoSelect);
    }

    /**
     * Executes a select option.
     * @param selectOption
     *  The select option.
     */
    private select(selectOption?: SelectOptions | boolean) {
        if(selectOption === undefined) {
            return;
        }
        let pivot, select;
        if(typeof selectOption === "object") {
            pivot  = selectOption.pivot;
            select = selectOption.select;
        } else {
            pivot  = selectOption;
            select = selectOption;
        }
        if(this.view instanceof MappingFileView) {
            const ids = this.ids ?? [];
            if(pivot) {
                this.view.setAllItemsSelect(false);
            }
            for(const id of ids) {
                this.view.setItemSelect(id, select);
            }
        } else if(this.view.length) {
            if(pivot) {
                this.view[0].fileView.setAllItemsSelect(false);
            }
            for(const view of this.view) {
                view.select(select);
            }
        }
    }

}

type SelectOptions = {

    /**
     * True to select, false to unselect.
     */
    select: boolean;

    /**
     * True if view should be solely selected.
     * False if view should be added to the current selection.
     */
    pivot: boolean;

}
