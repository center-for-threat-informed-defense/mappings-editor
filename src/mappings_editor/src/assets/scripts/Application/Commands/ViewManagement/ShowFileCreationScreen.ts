import type { ApplicationStore } from "@/stores/ApplicationStore";
import { AppCommand } from "../AppCommand";

/** Opens the form for creating a mapping file. */
export class ShowFileCreationScreen extends AppCommand {
    constructor(private readonly context: ApplicationStore) {
        super();
    }

    public async execute(): Promise<void> {
        this.context.showFileCreation = true;
    }
}
