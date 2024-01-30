import { EditorCommand, type DirectiveIssuer } from ".";

export class GroupCommand extends EditorCommand {

    /**
     * The list of commands in order of application.
     */
    private _commands: EditorCommand[];

    /**
     * If true, commands will be undone in reverse order of execution. If
     * false, commands will be undone in the same order of execution.
     */
    private _reverseCommandsOnUndo: boolean;

    /**
     * If true, when an exception occurs, all commands successfully run up to
     * that point are recursively rolled back and the exception is thrown. If
     * false, the exception is simply thrown.
     */
    private _rollbackOnFailure: boolean;


    /**
     * Executes a series of editor commands.
     */
    constructor();
    
    /**
     * Executes a series of editor commands.
     * @param reverseCommandsOnUndo
     *  If true, commands will be undone in reverse order of execution. If
     *  false, commands will be undone in the same order of execution.
     *  (Default: true)
     * @param rollbackOnFailure
     *  If true, when an exception occurs, all commands successfully run up to
     *  that point are recursively rolled back and the exception is thrown. If
     *  false, the exception is simply thrown.
     *  (Default: true)
     */
    constructor(reverseCommandsOnUndo?: boolean, rollbackOnFailure?: boolean);
    constructor(reverseCommandsOnUndo: boolean = true, rollbackOnFailure: boolean = true) {
        super();
        // Define phases
        this._commands = [];
        this._reverseCommandsOnUndo = reverseCommandsOnUndo;
        this._rollbackOnFailure = rollbackOnFailure;
    }
    

    /**
     * Appends a command to the command sequence.
     * @param command
     *  The command.
     * @returns
     *  The command.
     */
    public do<T extends EditorCommand>(command: T): T {
        this._commands.push(command);
        return command;
    }

    /**
     * Applies the set of commands.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public execute(issueDirective: DirectiveIssuer): void {
        this._execute("execute", issueDirective);
    }

    /**
     * Reapplies the set of commands.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public redo(issueDirective: DirectiveIssuer): void {
        this._execute("redo", issueDirective);
    }

    /**
     * Reverts the set of commands.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public undo(issueDirective: DirectiveIssuer): void {
        // Run first phase
        if(this._reverseCommandsOnUndo) {
            const l = this._commands.length - 1;
            for(let i = l; 0 <= i; i--) {
                this._commands[i].undo(issueDirective);
            }
        } else {
            for(let i = 0; i < this._commands.length; i++) {
                this._commands[i].undo(issueDirective);
            }
        }
    }

    /**
     * Applies the set of commands.
     * @param func
     *  The command function to apply.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    private _execute(func: "execute" | "redo", issueDirective: DirectiveIssuer) { 
        let i = 0;
        try {
            for(; i < this._commands.length; i++) {
                this._commands[i][func](issueDirective);
            }
        } catch (ex) {
            if(this._rollbackOnFailure) {
                if(this._reverseCommandsOnUndo) {
                    for(i--; 0 <= i; i--) {
                        this._commands[i].undo(() => {});
                    }
                } else {
                    for(let j = 0; j < i; j++) {
                        this._commands[j].undo(() => {});
                    }
                }
            }
            throw ex;
        }
    } 

}
