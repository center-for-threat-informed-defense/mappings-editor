import type { ApplicationStore } from "@/stores/ApplicationStore";
import { AppCommand } from "../AppCommand";

export class SetAutoScroll extends AppCommand {

    private context: ApplicationStore ;
    private value: boolean;

    /**
     * Toggles autoscroll (scrolls with selection when mappings move)
     * @param context
     *  The application context.
     * @param value
     *  The new value to put for this parameter
     */
    constructor(context: ApplicationStore, value: boolean) {
        super();
        this.context = context;
        this.value = value;
    }

    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        this.context.settings.view.auto_scroll = this.value;
    }

}
