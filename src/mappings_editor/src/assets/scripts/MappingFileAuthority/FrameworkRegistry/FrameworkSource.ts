import type { Framework } from "./Framework/Framework";
import type { FrameworkCategories } from "./Framework/FrameworkCategories";
import type { FrameworkObject } from "./Framework/FrameworkObject";

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


    /**
     * Moves objects in FrameworkCategores to FrameworkObjects
     */
  public getFrameworkObjects(categories: FrameworkCategories): FrameworkObject[] {
        let objects: FrameworkObject[] = [];
        for (const category in categories) {
            objects = [...objects, ...categories[category]]
        }
        const uniqueFrameworkObjects = new Set(objects);
        objects = [...uniqueFrameworkObjects];
        return objects;
    }

}
