import { EditorCommand, MappingFileView, MappingObjectView } from "../..";

export class SelectAllMappingObjectViews extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    /**
     * The item's select state upon execute.
     */
    public readonly execSelect: boolean | undefined;

    /**
     * The item's select state upon undo.
     */
    public readonly undoSelect: boolean | undefined;

    /**
     * The item's select state upon redo.
     */
    public readonly redoSelect: boolean | undefined;


    /**
     * Custom select behavior for all {@link MappingObjectView}s within a
     * {@link MappingFileView}. This command allows you to set the select state 
     * for each command state (i.e. execute and undo).
     * @param fileView
     *  The mapping file view to operate on.
     * @param execSelect
     *  The item's select state upon execute.
     * @param undoSelect
     *  The item's select state upon undo.
     */
    constructor(fileView: MappingFileView, execSelect: boolean, undoSelect: boolean);

    /**
     * Custom select behavior for all {@link MappingObjectView}s within a
     * {@link MappingFileView}. This command allows you to set the select state 
     * for each command state (i.e. execute, undo, and redo).
     * @param fileView
     *  The mapping file view to operate on.
     * @param execSelect
     *  The item's select state upon execute.
     * @param undoSelect
     *  The item's select state upon undo.
     * @param redoSelect
     *  The item's select state upon redo.
     */
    constructor(fileView: MappingFileView, execSelect?: boolean, undoSelect?: boolean, redoSelect?: boolean);
    constructor(fileView: MappingFileView, execSelect?: boolean, undoSelect?: boolean, redoSelect?: boolean) {
        super();
        this.fileView = fileView;
        this.execSelect = execSelect;
        this.undoSelect = undoSelect;
        this.redoSelect = redoSelect ?? this.execSelect;
    }


    /**
     * Executes the editor command.
     */
    public execute(): void {
        this.select(this.execSelect);
    }

    /**
     * Redoes the editor command.
     */
    public redo(): void {
        this.select(this.redoSelect);
    }

    /**
     * Undoes the editor command.
     */
    public undo(): void {
        this.select(this.undoSelect);

    }

    /**
     * Executes a select.
     * @param value
     *  The select value.
     */
    private select(value?: boolean) {
        if(value !== undefined) {
            this.fileView.setAllItemsSelect(value, o => o instanceof MappingObjectView);
        }
    }

}
