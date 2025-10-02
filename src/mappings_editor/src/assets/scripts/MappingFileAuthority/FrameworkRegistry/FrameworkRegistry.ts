import type { Framework } from "./Framework/Framework";
import type { FrameworkSource } from "./FrameworkSource"

export class FrameworkRegistry {

    /**
     * The framework registry.
     */
    private _registry: Map<string, Map<string, FrameworkSource>>


    /**
     * Creates a new {@link FrameworkRegistry}.
     */
    constructor() {
        this._registry = new Map();
    }


    /**
     * Registers a framework with the registry.
     * @param source
     *  The framework's source.
     */
    public registerFramework(source: FrameworkSource) {
        // Select framework
        if(!this._registry.has(source.id)) {
            this._registry.set(source.id, new Map());
        }
        const framework = this._registry.get(source.id)!;
        // Select framework version
        framework.set(source.version, source);
    }

    /**
     * Deregisters a framework from the registry, if it exists.
     * @param id
     *  The framework's identifier.
     * @param version
     *  The framework's version.
     * @returns
     *  True if the framework was removed, false otherwise.
     */
    public deregisterFramework(id: string, version: string): boolean {
        const versions = this._registry.get(id);
        if(versions && versions.has(version)) {
            versions.delete(version);
            if(!versions.size) {
                this._registry.delete(id);
            }
            return true;
        }
        return false;
    }

    /**
     * Deregisters all frameworks from the registry, if any exist.
     * @returns
     *  True if frameworks were deregistered, false otherwise.
     */
    public deregisterAllFrameworks(): boolean {
        if(this._registry.size) {
            this._registry.clear();
            return true;
        }
        return false;
    }

    /**
     * Tests if the registry contains a specific framework.
     * @param id
     *  The framework's identifier.
     * @param version
     *  The framework's version.
     */
    public hasFramework(id: string, version: string): boolean {
        return this._registry.get(id)?.get(version) !== undefined;
    }

    /**
     * Returns a registered framework.
     * @param id
     *  The framework's identifier.
     * @param version
     *  The framework's version.
     */
    public async getFramework(id: string, version: string): Promise<Framework> {
        const framework = this._registry.get(id);
        if(!framework) {
            throw new Error(`Registry has no framework '${ id }'.`);
        }
        const source = framework.get(version);
        if(!source){
            throw new Error(`Registry has no version '${ version }' of '${ id }'.`)
        }
        return await source.getFramework();
    }

}
