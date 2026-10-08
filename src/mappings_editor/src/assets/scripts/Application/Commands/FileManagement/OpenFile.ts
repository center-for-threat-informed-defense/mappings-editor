import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { MappingFile } from "@/assets/scripts/MappingFile";
import { GroupCommand } from "../GroupCommand";
import { LoadFile } from "./LoadFile";
import { AutoMigrateFile } from "./AutoMigrateFile";

/** Opens an existing mapping file and migrates its mappings. */
export class OpenFile extends GroupCommand {
    constructor(context: ApplicationStore, file: MappingFile, name?: string) {
        super();
        this.add(new LoadFile(context, file, name));
        this.add(new AutoMigrateFile(context));
    }
}
