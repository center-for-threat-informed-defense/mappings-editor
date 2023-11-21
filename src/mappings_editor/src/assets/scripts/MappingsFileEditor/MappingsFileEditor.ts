import type { Page } from "../MappingsFile/MappingFile";
import type { EditorCommand } from "./EditorCommands/EditorCommand";

export class PageEditor {

    /**
     * The editor's page.
     */
    public readonly page: Page;

    /**
     * The editor's undo stack.
     */
    private _undoStack: EditorCommand[];

    /**
     * The editor's redo stack.
     */
    private _redoStack: EditorCommand[];


    /**
     * Creates a new {@link PageEditor}.
     * @param page
     *  The editor's page.
     */
    private constructor(page: Page) {
        this.page = page;
        this._undoStack = [];
        this._redoStack = [];
    }


    ///////////////////////////////////////////////////////////////////////////
    //  1. Command Execution  /////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Executes one or more page editor commands.
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
        // Validate command
        if(cmd.page === PageCommand.NullPage) {
            return;
        }
        if(cmd.page !== this.page.instance) {
            throw new Error(
                "Command is not configured to operate on this page."
            );
        }
        // Execute command
        if(cmd.execute()) {
            this._redoStack = [];
            this._undoStack.push(cmd);
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. Page History  //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    
    /**
     * Undoes the last editor command.
     */
    public undo() {
        if(this._undoStack.length) {
            this._undoStack.at(-1)!.undo();
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
            this._redoStack.at(-1)!.execute();
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
    //  3. Page Import & Export  //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Creates a new page.
     * @param template
     *  The page's template.
     * @returns
     *  The page's editor.
     */
    public static createNew(template: PageTemplate): PageEditor {
        const page = new PageImporter(template).initialize().getPage();
        return new this(template.name, template.keys, page);
    }

    /**
     * Deserializes a page export.
     * @param template
     *  The page's template.
     * @param value
     *  The page's values.
     * @returns
     *  The page's editor.
     */
    public static fromFile(template: PageTemplate, value: any): PageEditor {
        const page = new PageImporter(template, value).initialize().getPage();
        return new this(template.name, template.keys, page);
    }

    /**
     * Exports the page as a text file.
     * @returns
     *  The serialized page.
     */
    public toFile(): string {
        return JSON.stringify({
            ...PageExporter.serialize(this.page).toObject(),
            report_date: new Date().toISOString(),
            __document: {
                authoring_tool_version: version,
                template_name: this.template,
                template_version: "0.1.0",
                template_identifier: this.page.id
            }
        }, null, 4);
    }

}
