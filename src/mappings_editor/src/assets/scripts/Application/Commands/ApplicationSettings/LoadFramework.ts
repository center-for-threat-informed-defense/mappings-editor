import { GroupCommand } from "../GroupCommand";
import { RegisterFramework } from "./RegisterFramework";
import { StoreFrameworkToBank } from "./StoreFrameworkToBank";
import { FrameworkSourceFile, type Framework } from "@/assets/scripts/MappingFileAuthority";
import type { ApplicationStore } from "@/stores/ApplicationStore";

export class LoadFrameworkFile extends GroupCommand {

    /**
     * Registers and saves a framework to the application's Framework Bank.
     * @param context
     *  The application context.
     * @param file
     *  The framework file.
     */
    constructor(context: ApplicationStore, file: Framework) {
        super();
        this.add(new StoreFrameworkToBank(context, file))
        this.add(new RegisterFramework(context, new FrameworkSourceFile(file)));
    }

}
