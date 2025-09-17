export type FrameworkObject = {

    /**
     * The framework object's id.
     */
    id: string,

    /**
     * The framework object's name.
     */
    name: string,

    /**
     * The framework object's description.
     */
    description: string

    /**
     * The framework object's child framework objects.
     */
    [key: string]: FrameworkObject[] | string;
}
