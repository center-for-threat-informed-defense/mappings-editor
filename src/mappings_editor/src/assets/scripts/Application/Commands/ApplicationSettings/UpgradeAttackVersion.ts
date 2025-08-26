import { AppCommand } from "../AppCommand";
import type { ApplicationStore } from "@/stores/ApplicationStore";


export class UpgradeAttackVersion extends AppCommand {
    /**
     * The framework's source.
     */
    public readonly newVersion: string;

    /**
     * The application context.
     */
    public readonly context: ApplicationStore;


    /**
     * Registers a Framework with the application.
     * @param context
     *  The application context.
     * @param framework
     *  The framework's source.
     */
    constructor(context: ApplicationStore, newVersion: string) {
        super();
        this.context = context;
        this.newVersion = newVersion;
    }

    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        console.log("Upgrading to version ", this.newVersion)
    }
}
