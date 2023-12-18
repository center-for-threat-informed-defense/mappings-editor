import type { EditorDirectives } from ".";

export abstract class EditorCommand {

    /**
     * Creates a new {@link EditorCommand}.
     */
    constructor(){}


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    abstract execute(): EditorDirectives;

    /**
     * Redoes the editor command.
     * @returns
     *  The command's directives.
     */
    public redo(): EditorDirectives {
        return this.execute();
    }
 
    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    abstract undo(): EditorDirectives;

}
