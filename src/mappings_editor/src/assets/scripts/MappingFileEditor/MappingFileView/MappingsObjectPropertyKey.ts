import type { MappingObject } from "../../MappingFile/MappingObject"
import type { Property } from "../../MappingFile/Property"


/**
 * Returns all {@link Property} keys from an `O`.
 */
type PropertiesOf<O> = {
    [K in keyof O]: O[K] extends Property ? K : never;
}[keyof O]

/**
 * All Mapping Object Property keys.
 */
export type MappingObjectPropertyKey = PropertiesOf<MappingObject>
