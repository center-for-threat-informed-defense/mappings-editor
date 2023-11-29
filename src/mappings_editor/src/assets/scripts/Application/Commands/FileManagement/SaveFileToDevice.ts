import { Browser } from "@/assets/scripts/Utilities/Browser";
import { AppCommand } from "../AppCommand";

export class SaveFileToDevice extends AppCommand {

    /**
     * The file's name.
     */
    private _name: string;

    /**
     * The file's extension.
     */
    private _extension: string;

    /**
     * The file's contents.
     */
    private _contents: string;


    /**
     * Saves a mapping file to the user's file system.
     * @param name
     *  The file's name.
     * @param extension
     *  The file's extension.
     * @param contents
     *  The file's contents.
     */
    constructor(name: string, extension: string, contents: string) {
        super();
        this._name = name;
        this._extension = extension;
        this._contents = contents;
    }


    /**
     * Executes the command.
     */
    public execute(): void {
        Browser.downloadTextFile(
            this._name,
            this._contents,
            this._extension
        );
    }

}
