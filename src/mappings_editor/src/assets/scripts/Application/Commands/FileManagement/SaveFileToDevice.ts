import { Browser } from "@/assets/scripts/Utilities/Browser";
import { AppCommand } from "../AppCommand";

export class SaveFileToDevice extends AppCommand {

    /**
     * The file's name.
     */
    public readonly name: string;

    /**
     * The file's extension.
     */
    public readonly extension: string;

    /**
     * The file's contents.
     */
    public readonly contents: Blob | string;


    /**
     * Saves a file to the user's file system.
     * @param name
     *  The file's name.
     * @param extension
     *  The file's extension.
     * @param contents
     *  The file's contents.
     */
    constructor(name: string, extension: string, contents: Blob | string) {
        super();
        this.name = name;
        this.extension = extension;
        this.contents = contents;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        Browser.downloadFile(
            this.name,
            this.contents,
            this.extension
        );
    }

}
