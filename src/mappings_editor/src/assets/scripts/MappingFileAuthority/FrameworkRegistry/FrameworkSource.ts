import type { Framework } from "./Framework/Framework";

export abstract class FrameworkSource {

    /**
     * The framework's identifier.
     */
    public readonly id: string;

    /**
     * The framework's version.
     */
    public readonly version: string;

    
    /**
     * Creates a new {@link FrameworkSource}.
     * @param id
     *  The framework's identifier.
     * @param version
     *  The framework's version.
     */
    constructor(id: string, version: string) {
        this.id = id;
        this.version = version;
    }


    /**
     * Returns the framework.
     * @returns
     *  A Promise that resolves with the framework.
     */
    abstract getFramework(): Promise<Framework>  

}