import { EditorCommand, EditorDirectives } from "..";
import type { BreakoutControl } from "../..";

export class MoveBreakout extends EditorCommand {

    /**
     * The breakout control.
     */
    public readonly control: BreakoutControl;

    /**
     * The breakout id.
     */
    public readonly id: number;

    /**
     * The destination index.
     */
    public readonly dst: number;


    /**
     * Moves a breakout.
     * @param control
     *  The breakout control.
     * @param id
     *  The breakout id.
     * @param dst
     *  The destination index.
     */
    constructor(control: BreakoutControl, id: number, dst: number) {
        super();
        this.control = control;
        this.id = id;
        this.dst = dst;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.control.moveBreakout(this.id, this.dst);
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
