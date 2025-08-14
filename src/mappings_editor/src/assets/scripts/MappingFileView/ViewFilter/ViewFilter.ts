import type { Property } from "@/assets/scripts/MappingFile/Property";
import type { MappingObject } from "@/assets/scripts/MappingFile/MappingObject";
import type { MappingObjectPropertyKey } from "../MappingObjectPropertyKey";

export abstract class ViewFilter {

    /**
     * Creates a new {@link ViewFilter}.
     */
    constructor() {}


    /**
     * Tests if a {@link Property} is visible.
     * @param key
     *  The property's {@link MappingObject} key.
     * @param prop
     *  The property.
     * @returns
     *  True if the property is visible, false otherwise.
     */
    public abstract isPropertyVisible(key: MappingObjectPropertyKey, prop: Property): boolean;

    /**
     * Tests if a {@link MappingObject} is visible.
     * @param object
     *  The mapping object.
     * @returns
     *  True if the mapping object is visible, false otherwise.
     */
    public abstract isObjectVisible(object: MappingObject): boolean;

}
