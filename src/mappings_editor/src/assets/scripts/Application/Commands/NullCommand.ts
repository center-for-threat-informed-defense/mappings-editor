import { AppCommand } from "./AppCommand"

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
    public async execute(): Promise<void> {}

}
