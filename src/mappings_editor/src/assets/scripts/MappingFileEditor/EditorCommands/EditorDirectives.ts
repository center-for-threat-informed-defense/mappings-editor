export enum EditorDirectives {

    /**
     * Specify if nothing should happen.
     */
    None                 = 0b00,

    /**
     * Specify if the command should be recorded to the undo history.
     */
    Record               = 0b01,

    /**
     * Specify if the command should trigger an autosave.
     */
    Autosave             = 0b10

}
