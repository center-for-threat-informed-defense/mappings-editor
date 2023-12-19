export enum EditorDirectives {

    /**
     * Specify if nothing should happen.
     */
    None                 = 0b000000,

    /**
     * Specify if the command should be recorded.
     */
    Record               = 0b000001,

    /**
     * Specify if the command should be fully recorded.
     * @remarks
     *  Any command that modifies the file itself should be fully recorded.
     */
    FullRecord           = 0b000011,

    /**
     * Specify if the editor should recalculate the view's breakouts.
     */
    RebuildBreakouts     = 0b000100,

    /**
     * Specify if the editor should recalculate view item positions.
     */
    RecalculatePositions = 0b001000,

    /**
     * Specify if the object should be moved into view.
     */
    MoveCamera           = 0b010000,

    /**
     * Specify if the camera object should be exclusively selected.
     */
    ExclusiveSelect      = 0b100000,

}
