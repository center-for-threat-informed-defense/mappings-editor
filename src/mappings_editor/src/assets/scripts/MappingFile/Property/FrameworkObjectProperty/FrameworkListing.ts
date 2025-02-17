export abstract class FrameworkListing {

    /**
     * The default id length.
     */
    protected static DEFAULT_OBJ_ID_LEN: number = 6;

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
     * The framework listing's current coverage.
     */
    abstract get coverage(): [number, number];

    /**
     * The framework listing's object id length.
     */
    abstract get objectIdLength(): number;


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


    /**
     * Tests if the framework contains the specified object.
     * @param objectId
     *  The object's id.
     * @param objectText
     *  The object's text.
     * @returns
     *  True if the framework contains the object, false otherwise.
     */
    public has(objectId: string | null, objectText: string | null) {
        return this.options.get(objectId) === objectText;
    }

}
