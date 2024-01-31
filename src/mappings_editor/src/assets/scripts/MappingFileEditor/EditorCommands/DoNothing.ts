import { EditorCommand } from "..";

export class DoNothing extends EditorCommand {

    /**
     * Does nothing.
     */
    constructor() {
        super();
    }


    /**
     * Executes the editor command.
     */
    public execute(): void {}

    /**
     * Undoes the editor command.
     */
    public undo(): void {}

}
