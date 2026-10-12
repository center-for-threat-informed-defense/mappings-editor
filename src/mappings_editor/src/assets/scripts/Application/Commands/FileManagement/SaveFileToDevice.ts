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

    public readonly saveAs : boolean;


    /**
     * Saves a file to the user's file system.
     * @param name
     *  The file's name.
     * @param extension
     *  The file's extension.
     * @param contents
     *  The file's contents.
     * @param saveAs
     * Whether to open a dialog to choose a new name to save the file as.
     */
    constructor(
        name: string,
        extension: string,
        contents: Blob | string,
        saveAs: boolean = false
    ) {
        super();
        this.name = name;
        this.extension = extension;
        this.contents = contents;
        this.saveAs = saveAs;
    }


    /**
     * Executes the command.
     */
    public async execute(): Promise<void> {
        if (this.saveAs) {
            Browser.openFileSaveDialog(
                this.name,
                this.contents,
                [this.extension]
            );
        } else {
            Browser.downloadFile(
                this.name,
                this.contents,
                this.extension
            );
        }
    }

}
