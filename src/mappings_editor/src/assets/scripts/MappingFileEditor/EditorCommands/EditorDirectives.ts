export enum EditorDirectives {

    /**
     * Specify if nothing should happen.
     */
    None                 = 0b00000,

    /**
     * Specify if the command should be recorded.
     */
    Record               = 0b00001,

    /**
     * Specify if the editor should recalculate the view's breakouts.
     */
    RebuildBreakouts     = 0b00010,

    /**
     * Specify if the editor should recalculate view item positions.
     */
    RecalculatePositions = 0b00100,

    /**
     * Specify if the object should be moved into view.
     */
    MoveCamera           = 0b01000,

    /**
     * Specify if the camera object should be exclusively selected.
     */
    ExclusiveSelect      = 0b10000,

}
