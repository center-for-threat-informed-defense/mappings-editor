import type { Framework } from "./Framework/Framework";
import type { FrameworkSource } from "./FrameworkSource"

export class FrameworkRegistry {

    /**
     * The framework registry.
     */
    private _registry: Map<string, Map<string, FrameworkSource>>

    
    /**
     * Creates a new {@link MappingFrameworkRegistry}.
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
        if(!framework.has(source.version)) {
            framework.set(source.version, source);
        } else {
            throw new Error(
                `Framework '${ 
                    source.id
                }@${
                    source.version
                }' already registered.`
            );
        }
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
