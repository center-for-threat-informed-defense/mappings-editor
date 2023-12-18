import type { FrameworkCategories } from "./FrameworkCategories";

export type Framework = {

    /**
     * The framework's identifier.
     */
    frameworkId: string;

    /**
     * The framework's version.
     */
    frameworkVersion: string;

    /**
     * The framework's objects organized by category. 
     */
    categories: FrameworkCategories;

}
