import { EditorCommand, EditorDirectives, CameraCommand } from ".";

export class GroupCommand extends EditorCommand {

    /**
     * The list of commands in order of application.
     */
    private _commands: EditorCommand[];

    
    /**
     * The group's {@link CameraCommand}s in order of execution.
     */
    public get cameraCommands(): CameraCommand[] {
        return this.getCameraCommands(this);
    }


    /**
     * Executes a series of editor commands.
     */
    constructor() {
        super();
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

    /**
     * Returns all {@link CameraCommand}s from a {@link GroupCommand} in order
     * of execution.
     * @param cmd
     *  The {@link GroupCommand}.
     * @returns
     *  The {@link CameraCommand}s.
     */
    private getCameraCommands(cmd: GroupCommand): CameraCommand[] {
        let commands: CameraCommand[] = []
        for(let i = cmd._commands.length - 1; 0 <= i; i--) {
            const command = cmd._commands[i];
            if(command instanceof GroupCommand) {
                commands = commands.concat(this.getCameraCommands(command));
            } else if(command instanceof CameraCommand) {
                commands.push(command);
            }
        }
        return commands;
    }

}
