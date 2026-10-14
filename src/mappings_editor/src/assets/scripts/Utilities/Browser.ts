
export class Browser {


    ///////////////////////////////////////////////////////////////////////////
    //  1. Download Files  ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The internal download link used to initiate downloads.
     */
    private static _aLink = document.createElement("a");

    /**
     * Downloads a file.
     * @param filename
     *  The file's name.
     * @param text
     *  The file's contents.
     * @param ext
     *  The file's extension.
     *  (Default: 'txt')
     */
    public static downloadFile(filename: string, contents: Blob | string, ext = "txt") {
        if(typeof contents === "string") {
            contents = new Blob([contents], { type: "octet/stream" });
        }
        const url = window.URL.createObjectURL(contents);
        this._aLink.href = url;
        this._aLink.download = `${ filename }.${ ext }`;
        this._aLink.click();
        window.URL.revokeObjectURL(url);
    }


    ///////////////////////////////////////////////////////////////////////////
    //  2. File Selection Dialogs  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Prompts the user to select a text file from their file system.
     * @param accept
     *  The acceptable file types. (ex. 'txt', 'json', etc.)
     * @param multipleFiles
     *  If true, multiple files will be selectable.
     *  (Default: `false`)
     * @returns
     *  A Promise that resolves with the chosen text file(s).
     */
    public static openTextFileDialog(types?: string[], multipleFiles?: true): Promise<TextFile[]>;
    public static openTextFileDialog(types?: string[], multipleFiles?: false): Promise<TextFile>;
    public static openTextFileDialog(types?: string[], multipleFiles: boolean = false): Promise<TextFile | TextFile[]> {

        // Create file input
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        // Configure acceptable file types
        if(types) {
            fileInput.accept = types.map(t => `.${ t }`).join(",")
        }
        // Configure allowable number of files
        fileInput.multiple = multipleFiles;

        // Configure file input
        const result = new Promise<TextFile | TextFile[]>((resolve, reject) => {
            fileInput.addEventListener("change", (event) => {
                // Access files
                const files = (event.target as HTMLInputElement).files;
                if(files === null) {
                    reject(new Error("The provided files could not be accessed."));
                    return;
                }
                // Read files
                const readingFiles: Promise<TextFile>[] = [];
                for(const file of files){
                    readingFiles.push(new Promise(res => {
                        const reader = new FileReader();
                        reader.onload = (e: ProgressEvent<FileReader>) => {
                            const [filename, extension] = file.name.split(/\.(?=[^.]+$)/);
                            res({ filename, extension, contents: e.target?.result });
                        }
                        reader.readAsText(file);
                    }));
                }
                // Return files
                Promise.all(readingFiles).then(readFiles => {
                    resolve(multipleFiles ? readFiles : readFiles[0])
                });
            });
        });

        // Click file input
        fileInput.click();

        // Return result
        return result;

    }


    ///////////////////////////////////////////////////////////////////////////
    //  3. Browser Window Control  ////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Opens an element in fullscreen.
     * @param el
     *  The element to fullscreen.
     *  (Default: `document.body`)
     */
    public static fullscreen(el: HTMLElement = document.body) {
        const cast = el as any;
        if (cast.requestFullscreen) {
            cast.requestFullscreen();
        } else if (cast.webkitRequestFullscreen) {
            // Safari
            cast.webkitRequestFullscreen();
        } else if (cast.msRequestFullscreen) {
            // IE11
            cast.msRequestFullscreen();
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  4. Operating System Detection  ////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Returns the device's current operating system class.
     * @returns
     *  The device's current operating system class.
     */
    public static getOperatingSystemClass(): OperatingSystem {
        if(navigator.userAgent.search("Win") !== -1) {
            return OperatingSystem.Windows
        } else if(navigator.userAgent.search("Mac") !== -1) {
            return OperatingSystem.MacOS;
        } else if(navigator.userAgent.search("X11") !== -1) {
            return OperatingSystem.UNIX;
        } else if(navigator.userAgent.search("Linux") !== -1) {
            return OperatingSystem.Linux;
        } else {
            return OperatingSystem.Other;
        }
    }


    ///////////////////////////////////////////////////////////////////////////
    //  5. File Save Dialog  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Opens a file save dialog where file name can be chosen. Native file system dialog
     * is not supported in all browsers. An error is thrown if not supported.
     * @param filename
     *  The file's name.
     * @param text
     *  The file's contents.
     * @param types
     *  The acceptable file types. (ex. 'txt', 'json', etc.)
     * @returns
     * The name of the saved file, or null if something went wrong.
     */
    public static async openFileSaveDialog(
        filename: string,
        contents: Blob | string,
        types: string[],
    ): Promise<string | null> {
        if (typeof window.showSaveFilePicker === 'function') {

            // Options for showSaveFilePicker
            const opts: ShowSaveFilePickerOptions = {
                // https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker#types
                types: [],
                suggestedName: filename
            };

            for (const s of types) {
                let mimeType = 'text/plain';
                if (s === 'json') {
                    mimeType = 'application/json';
                }

                opts.types?.push({
                    description: '',
                    accept: {
                        [mimeType]: [startExtensionWithDot(s)]
                    }
                });
            }

            try {
                const fileHandle : FileSystemFileHandle = await window.showSaveFilePicker(opts);
                // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle#writing_a_file
                const writable = await fileHandle.createWritable();
                await writable.write(contents);
                await writable.close();
                return fileHandle.name;
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        console.debug('File save was canceled by user.');
                    } else {
                        console.error(error);
                    }
                } else {
                    console.error(error);
                }
            }
        } else {
            throw new TypeError('Your browser does not support showSaveFilePicker.')
        }

        return null;
    }
}

/**
 * Recognized operating systems.
 */
export enum OperatingSystem {
    Windows,
    MacOS,
    UNIX,
    Linux,
    Other
}


///////////////////////////////////////////////////////////////////////////
//  Internal Types  ///////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


type TextFile = {
    filename: string,
    extension: string,
    contents: string | ArrayBuffer | null | undefined
}

interface ShowSaveFilePickerOptions {
    types?: {
        description: string,
        accept: { [key: string]: string[] }
    }[],
    suggestedName?: string
}

function startExtensionWithDot(ext: string) {
    if (ext && ext[0] !== ".") {
        return "." + ext;
    }
    return ext;
}
