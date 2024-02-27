import type { MappingObjectExport } from "..";

export type MappingObjectImport = Omit<Partial<MappingObjectExport>, "references"> & {

    /**
     * The mapping object's references.
     */
    references?: string[] | string;

}
