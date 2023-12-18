import type { Framework } from "./Framework/Framework";
import { FrameworkSource } from "./FrameworkSource";

export class FrameworksSourceUrl extends FrameworkSource {

    /**
     * The framework's url.
     */
    private _url: string;

    /**
     * The framework's file.
     */
    private _file: Framework | undefined;

    
    /**
     * Creates a {@link FrameworksSourceUrl}.
     * @param id
     *  The framework's identifier.
     * @param version
     *  The framework's version.
     * @param url
     *  The frameworks's url.
     */
    constructor(id: string, version: string, url: string) {
        super(id, version);
        this._url = `${ import.meta.env.BASE_URL }${ url }`;
    }


    /**
     * Returns the framework.
     * @returns
     *  A Promise that resolves with the framework.
     */
    async getFramework(): Promise<Framework> {
        if(this._file === undefined) {
            try {
                this._file = await (await fetch(this._url)).json() as Framework;
            } catch(err) {
                throw new Error(`Failed to download framework '${ this._url }'.`);
            }
            if(this.id !== this._file.frameworkId) {
                const dl = this._file.frameworkId;
                const ex = this.id;
                throw new Error(`Downloaded framework '${ dl }', expected '${ ex }'.`);
            }
            if(this.version !== this._file.frameworkVersion) {
                const dl = `${ this._file.frameworkId }@${ this._file.frameworkVersion }`;
                const ex = `${ this.id }@${ this.version }`
                throw new Error(`Downloaded framework '${ dl }', expected '${ ex }'.`);
            }
        }
        return this._file;
    }

}
