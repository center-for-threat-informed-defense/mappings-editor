import { SaveFileToDevice } from "./SaveFileToDevice";

export class SaveMappingFileToDevice extends SaveFileToDevice {

    /**
     * The file's id.
     */
    public readonly id: string;


    /**
     * Saves a mapping file to the user's file system.
     * @param id
     *  The mapping file's id.
     * @param name
     *  The mapping file's name.
     * @param extension
     *  The mapping file's extension.
     * @param contents
     *  The mapping file's contents.
     */
    constructor(id: string, name: string, extension: string, contents: string) {
        super(name, extension, contents);
        this.id = id;
    }

}
