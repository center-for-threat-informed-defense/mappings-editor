import { ViewObjectCommand, type EditorCommand, EditorDirectives } from ".";

export class GroupCommand implements EditorCommand {

    /**
     * The list of commands in order of application.
     */
    private _commands: EditorCommand[];
    

    /**
     * The command's view objects.
     */
    public get ids(): Set<string> {
        const ids = new Set<string>();
        for(const command of this._commands) {
            if(command instanceof ViewObjectCommand) {
                ids.add(command.id);
            }
        }
        return ids;
    }


    /**
     * Executes a series of page commands.
     */
    constructor() {
        this._commands = [];
    }
    

    /**
     * Adds a command to the group.
     * @param command
     *  The command.
     */
    public add(command: EditorCommand) {
        this._commands.push(command);
    }

    /**
     * Applies the set of commands.
     * @returns
     *  The editor's directives.
     */
    public execute(): EditorDirectives {
        let i = 0;
        const l = this._commands.length;
        let directives = EditorDirectives.None;
        try {
            for(; i < l; i++) {
                directives |= this._commands[i].execute();
            }
        } catch (ex) {
            // Rollback on failure
            for(i--; 0 <= i; i--) {
                this._commands[i].undo();
            }
            throw ex;
        }
        return directives;
    }

    /**
     * Reverts the set of commands.
     * @returns
     *  The editor's directives.
     */
    public undo(): EditorDirectives {
        const l = this._commands.length - 1;
        let directives = EditorDirectives.None;
        for(let i = l; 0 <= i; i--) {
            directives |= this._commands[i].undo();
        }
        return directives;
    }

}
