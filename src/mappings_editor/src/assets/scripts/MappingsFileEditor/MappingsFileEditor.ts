import { randomUUID } from "../Utilities";
import { GroupCommand, type EditorCommand } from ".";
import { FreeFrameworkObjectProperty, MappingFile, MappingObject } from "../MappingsFile";

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
        // TODO: Compute the file name using the Mapping File.
        return "Untitled Mappings File";
    }


    /**
     * Creates a new {@link MappingFileEditor}.
     * @param file
     *  The editor's Mapping File.
     */
    constructor(file: MappingFile) {
        this.id = randomUUID();
        this.file = file;
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
        if(cmd.execute()) {
            this._redoStack = [];
            this._undoStack.push(cmd);
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
            this._undoStack[this._undoStack.length - 1].undo();
            this._redoStack.push(this._undoStack.pop()!);
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
            this._redoStack[this._redoStack.length - 1].execute();
            this._undoStack.push(this._redoStack.pop()!);
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
        // Define mapping options
        const framework = "NONE";
        const version = "0.0.0";
        const author = "PHANTOM";
        const authorContact = "PHANTOM@SPECTER.ORG";
        // Return mapping file
        return new MappingFile({
            sourceFramework: framework,
            sourceVersion: version,
            targetFramework: framework,
            targetVersion: version,
            author: author,
            authorContact: authorContact,
            authorOrganization: "SPECTER LTD.",
            creationDate: new Date(),
            modifiedDate: new Date(),
            mappingObjectTemplate: new MappingObject({
                sourceObject: new FreeFrameworkObjectProperty(framework, version),
                targetObject: new FreeFrameworkObjectProperty(framework, version),
                author: author,
                authorContact: authorContact,
                comments: "",
                group: ""
            })
        });
    }
    
}
