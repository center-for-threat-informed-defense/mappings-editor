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
    public async execute(): Promise<void> {}

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}
