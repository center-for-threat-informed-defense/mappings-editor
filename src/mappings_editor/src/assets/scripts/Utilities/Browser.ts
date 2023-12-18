export class Browser {
    

    ///////////////////////////////////////////////////////////////////////////
    //  1. Download Files  ////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////


    /**
     * The internal download link used to initiate downloads.
     */
    private static _aLink = document.createElement("a");

    /**
     * Downloads a text file.
     * @param filename
     *  The text file's name.
     * @param text
     *  The text file's contents.
     * @param ext
     *  The text file's extension.
     *  (Default: 'txt')
     */
    public static downloadTextFile(filename: string, text: string, ext = "txt") {
        const blob = new Blob([text], { type: "octet/stream" });
        const url = window.URL.createObjectURL(blob);
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
     * @returns
     *  A Promise that resolves with the chosen text file.
     */
    public static openTextFileDialog(): Promise<TextFile> {
            
        // Create file input
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        
        // Configure file input
        const result = new Promise<TextFile>((resolve) => {
            fileInput.addEventListener("change", (event) => {
                const file = (event.target as any).files[0];
                const reader = new FileReader();
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    resolve({
                        filename: file.name,
                        contents: e.target?.result
                    });
                }
                reader.readAsText(file);
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
    contents: string | ArrayBuffer | null | undefined
}
