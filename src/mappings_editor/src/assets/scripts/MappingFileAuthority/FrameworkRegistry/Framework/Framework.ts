import type { FrameworkCategories } from "./FrameworkCategories";
import type { FrameworkObject } from "./FrameworkObject";

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
    frameworkObjects: FrameworkObject[];

    /**
     * The framework's objects organized by category.
     */
    categories: FrameworkCategories;
}
