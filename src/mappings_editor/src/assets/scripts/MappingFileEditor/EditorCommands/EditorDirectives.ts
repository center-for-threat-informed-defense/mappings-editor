export enum EditorDirectives {

    /**
     * Specify if nothing should happen.
     */
    None   = 0b0000,

    /**
     * Specify if the command should be recorded.
     */
    Record = 0b0001,

    /**
     * Specify if the editor should re-render the view.
     */
    Render = 0b0010,

    /**
     * Specify if the object should be focused.
     */
    Focus  = 0b0011

}
