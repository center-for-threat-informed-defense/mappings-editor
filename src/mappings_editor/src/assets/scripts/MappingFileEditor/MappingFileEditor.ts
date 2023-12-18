import { toRaw } from "vue";
import { EditableStrictFrameworkListing, MappingFile, MappingObject, StrictFrameworkObjectProperty, StringProperty } from "../MappingFile";
import { GroupCommand, EditorCommand, MappingFileView, EditorDirectives, CameraCommand } from ".";

export class MappingFileEditor {

    /**
     * The phantom mappings editor.
     */
    public static Phantom: MappingFileEditor = new this(
        this.createPhantomPage()
    );
    
    /**
     * The editor's id.
     */
    public readonly id: string;

    /**
     * The editor's Mapping File.
     */
    public readonly file: MappingFile;

    /**
     * The editor's file view.
     */
    public readonly view: MappingFileView;

    /**
     * The editor's undo stack.
     */
    private _undoStack: EditorCommand[];

    /**
     * The editor's redo stack.
     */
    private _redoStack: EditorCommand[];


    /**
     * The editor's file name.
     */
    public get name(): string {
        return `${ 
            this.file.sourceFramework
        }@${
            this.file.sourceVersion
        }_${
            this.file.targetFramework
        }@${
            this.file.targetVersion
        }`;
    }


    /**
     * Creates a new {@link MappingFileEditor}.
     * @param file
     *  The editor's Mapping File.
     */
    constructor(file: MappingFile) {
        this.id = file.id;
        this.file = file;
        this.view = new MappingFileView(
            this.file,
            {
                sectionHeight: 33,
                sectionPaddingHeight: 10,
                objectHeightCollapsed: 42,
                objectHeightUncollapsed: 328,
                objectPaddingHeight: 6,
                loadMargin: 0
            }
        );
        this._undoStack = [];
        this._redoStack = [];
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Command Execution  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Executes one or more editor commands.
     * @param commands
     *  The commands.
     */
    public execute(...commands: EditorCommand[]) {
        // Package command
        let cmd: EditorCommand;
        if(commands.length === 0) {
            return;
        } else if(commands.length === 1) {
            cmd = commands[0];
        } else {
            const grp = new GroupCommand();
            for(const command of commands) {
                grp.add(command);
            }
            cmd = grp;
        }
        // Execute command
        const directives = cmd.execute();
        if(directives & EditorDirectives.Record) {
            this._redoStack = [];
            this._undoStack.push(cmd);
        }
        this.executeDirectives(cmd, directives);
    }

    /**
     * Executes a command's {@link EditorDirectives}.
     * @param cmd
     *  The command.
     * @param dirs
     *  The command's editor directives.
     */
    public executeDirectives(cmd: EditorCommand, dirs: EditorDirectives) {
        // Update view
        if(dirs & EditorDirectives.RebuildBreakouts) {
            // Perform rebuild on raw object to improve performance
            this.view.rebuildBreakouts(toRaw);
        } else if(dirs & EditorDirectives.RecalculatePositions) {
            // Perform rebuild on raw object to improve performance
            this.view.recalculateViewItemPositions(toRaw);
        }
        // Get camera commands
        let cameraCommands: CameraCommand[] = [];
        if(cmd instanceof GroupCommand) {
            cameraCommands = cmd.cameraCommands;
        } else if(cmd instanceof CameraCommand) {
            cameraCommands = [cmd];
        }
        // Select camera items
        if(dirs & EditorDirectives.ExclusiveSelect) {
            this.view.unselectAllViewItems();
            for(const cmd of cameraCommands) {
                this.view.selectViewItem(cmd.id);
            }
        }
        // Move camera
        if(dirs & EditorDirectives.MoveCamera && cameraCommands[0]) {
            this.view.moveToViewItem(
                cameraCommands[0].id,
                cameraCommands[0].position,
                cameraCommands[0].fromHangers,
                cameraCommands[0].strict
            );
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. File History  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * Undoes the last editor command.
     */
    public undo() {
        if(this._undoStack.length) {
            const cmd = this._undoStack[this._undoStack.length - 1];
            const directives = cmd.undo();
            this._redoStack.push(this._undoStack.pop()!);
            this.executeDirectives(cmd, directives);
        }
    }

    /**
     * Tests if the last command can be undone.
     * @returns
     *  True if the last command can be undone, false otherwise.
     */
    public canUndo(): boolean {
        return 0 < this._undoStack.length;
    }

    /**
     * Redoes the last undone editor command.
     */
    public redo() {
        if(this._redoStack.length) {
            const cmd = this._redoStack[this._redoStack.length - 1];
            const directives = cmd.redo();
            this._undoStack.push(this._redoStack.pop()!);
            this.executeDirectives(cmd, directives);
        }
    }

    /**
     * Tests if the last undone command can be redone.
     * @returns
     *  True if the last undone command can be redone, false otherwise.
     */
    public canRedo(): boolean {
        return 0 < this._redoStack.length;
    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Phantom  ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates a phantom {@link MappingFile}.
     * @returns
     *  The phantom {@link MappingFile}.
     */
    private static createPhantomPage(): MappingFile {
        const framework = new EditableStrictFrameworkListing("NONE", "0.0.0");
        return new MappingFile({
            creationDate: new Date(),
            modifiedDate: new Date(),
            mappingObjectTemplate: new MappingObject({
                sourceObject: new StrictFrameworkObjectProperty("Phantom", framework),
                targetObject: new StrictFrameworkObjectProperty("Phantom", framework),
                author: new StringProperty("Phantom"),
                authorContact: new StringProperty("Phantom"),
                authorOrganization: new StringProperty("Phantom"),
                comments: new StringProperty("Phantom")
            })
        });
    }
    
}
