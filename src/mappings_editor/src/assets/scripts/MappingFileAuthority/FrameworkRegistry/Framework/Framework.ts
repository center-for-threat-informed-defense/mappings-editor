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
     * The framework's set of framework objects.
     */
    frameworkObjects: FrameworkObject[];
}
