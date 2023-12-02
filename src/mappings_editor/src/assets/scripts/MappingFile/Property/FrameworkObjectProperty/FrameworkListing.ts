export abstract class FrameworkListing {

    /**
     * The framework's identifier.
     */
    public readonly id: string;

    /**
     * The framework's version.
     */
    public readonly version: string;


    /**
     * The framework listing.
     */
    abstract get options(): ReadonlyMap<string | null, string | null>;


    /**
     * Creates a new {@link FrameworkListing}.
     * @param framework
     *  The framework's identifier.
     * @param version
     *  The framework's version.
     */
    constructor(framework: string, version: string) {
        this.id = framework;
        this.version = version;
    }

}
