import type { Framework } from "./Framework/Framework";
import { FrameworkSource } from "./FrameworkSource";

export class FrameworksSourceFile extends FrameworkSource {

    /**
     * The framework's file.
     */
    private _file: Framework;

    
    /**
     * Creates a {@link FrameworksSourceFile}.
     * @param file
     *  The source's framework file.
     */
    constructor(file: Framework) {
        super(file.frameworkId, file.frameworkVersion);
        this._file = file;
    }


    /**
     * Returns the framework.
     * @returns
     *  A Promise that resolves with the framework.
     */
    override getFramework(): Promise<Framework> {
        return Promise.resolve<Framework>(this._file);
    }

}
