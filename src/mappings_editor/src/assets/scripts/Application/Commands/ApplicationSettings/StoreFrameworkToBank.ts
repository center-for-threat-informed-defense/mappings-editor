import { AppCommand } from "../AppCommand";
import type { Framework } from "@/assets/scripts/MappingFileAuthority";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class StoreFrameworkToBank extends AppCommand {

    /**
     * The framework.
     */
    public readonly framework: Framework;

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Stores a framework in the application's Framework Bank.
     * @param context
     *  The application context.
     * @param framework
     *  The framework.
     */
    constructor(context: ApplicationStore, framework: Framework) {
        super();
        this.context = context;
        this.framework = framework;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        const { frameworkId, frameworkVersion } = this.framework;
        const id = `${frameworkId}@${frameworkVersion}`;
        const name = JSON.stringify({ id: frameworkId, version: frameworkVersion });
        this.context.frameworkBank.saveFile(id, name, JSON.stringify(this.framework));
    }

}
