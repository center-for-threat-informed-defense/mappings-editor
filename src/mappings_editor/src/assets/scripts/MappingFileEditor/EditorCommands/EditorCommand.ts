import type { DirectiveIssuer } from ".";

export abstract class EditorCommand {

    /**
     * Creates a new {@link EditorCommand}.
     */
    constructor(){}


    /**
     * Executes the editor command.
     */
    public abstract execute(): void;

    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public abstract execute(issueDirective?: DirectiveIssuer): void;

    /**
     * Redoes the editor command.
     */
    public redo(): void;
    
    /**
     * Redoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public redo(issueDirective?: DirectiveIssuer): void;
    public redo(issueDirective?: DirectiveIssuer) {
        this.execute(issueDirective);
    }

    /**
     * Undoes the editor command.
     */
    abstract undo(): void;
 
    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    abstract undo(issueDirective?: DirectiveIssuer): void;

}
