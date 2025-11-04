import type { FrameworkObject } from "./FrameworkObject";

export type FrameworkDiff = {
    added: FrameworkObject[],
    removed: FrameworkObject[],
}
