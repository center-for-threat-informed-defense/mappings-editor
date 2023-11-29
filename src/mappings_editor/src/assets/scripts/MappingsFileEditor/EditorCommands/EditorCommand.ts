import type { EditorDirectives } from ".";

export abstract class EditorCommand {

    /**
     * Creates a new {@link EditorCommand}.
     */
    constructor(){}


    /**
     * Executes an editor command.
     * @returns
     *  The command's directives.
     */
    abstract execute(): EditorDirectives;

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    abstract undo(): EditorDirectives;

}
