import { EditorCommand, EditorDirectives } from "..";
import type { BreakoutControl } from "../..";

export class SetBreakoutState extends EditorCommand {

    /**
     * The breakout control.
     */
    public readonly control: BreakoutControl;

    /**
     * The breakout id.
     */
    public readonly id: number;

    /**
     * True to enable the breakout, false to disable it.
     */
    public readonly value: boolean;


    /**
     * Enables/Disables a breakout.
     * @param control
     *  The breakout control.
     * @param id
     *  The breakout id.
     * @param value
     *  True to enable the breakout, false to disable it.
     */
    constructor(control: BreakoutControl, id: number, value: boolean) {
        super();
        this.control = control;
        this.id = id;
        this.value = value;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.control.setBreakoutState(this.id, this.value);
        return EditorDirectives.RebuildBreakouts;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        return EditorDirectives.None;
    }

}
