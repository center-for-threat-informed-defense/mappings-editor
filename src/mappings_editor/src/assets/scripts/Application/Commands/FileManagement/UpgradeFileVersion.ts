import type { ApplicationStore } from "@/stores/ApplicationStore";
import { AppCommand } from "../AppCommand";

export class UpgradeFileVersion extends AppCommand {

    private context: ApplicationStore ;
    private value: string;

    /**
     * Upgrades the ATT&CK version for the loaded mappings file
     * @param context
     *  The application context.
     * @param value
     *  The new value to put for this parameter
     */
    constructor(context: ApplicationStore, value: string) {
        super();
        this.context = context;
        this.value = value;
    }

    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.activeEditor.file.targetVersion = this.value;
    }

}
