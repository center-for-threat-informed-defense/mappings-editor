import { AppCommand } from ".."

export class NullCommand extends AppCommand {

    /**
     * Does nothing.
     */
    constructor() {
        super();
    }


    /**
     * Executes the command.
     */
    public execute(): void {}

}
