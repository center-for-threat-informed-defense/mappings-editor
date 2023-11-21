import type { FrameworkCategories } from "./FrameworkCategories";

export type Framework = {

    /**
     * The framework's identifier.
     */
    id: string;

    /**
     * The framework's version.
     */
    version: string;

    /**
     * The framework's objects organized by category. 
     */
    categories: FrameworkCategories;

}
