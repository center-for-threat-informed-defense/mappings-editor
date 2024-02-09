export class Reactivity {

    /**
     * A function that unwraps `this` from a reactive context.
     */
    public static toRaw: <T>(obj: T) => T = obj => obj;

}