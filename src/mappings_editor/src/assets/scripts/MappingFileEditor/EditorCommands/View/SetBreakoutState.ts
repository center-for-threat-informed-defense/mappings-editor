import { EditorCommand } from "..";
import type { BreakoutControl, MappingFileView } from "../..";

export class SetBreakoutState extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

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
        this.fileView = control.fileView;
        this.control = control;
        this.id = id;
        this.value = value;
    }


    /**
     * Executes the editor command.
     */
    public async execute(): Promise<void> {
        this.control.setBreakoutState(this.id, this.value);
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}
