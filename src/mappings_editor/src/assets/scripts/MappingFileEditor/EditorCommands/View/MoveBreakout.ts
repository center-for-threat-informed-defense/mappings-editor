import { EditorCommand } from "..";
import type { BreakoutControl, MappingFileView } from "../..";

export class MoveBreakout extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    /**
     * The breakout control.
     */
    public readonly control: BreakoutControl<string>;

    /**
     * The breakout id.
     */
    public readonly id: string;

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
    constructor(control: BreakoutControl<string>, id: string, dst: number) {        super();
        this.fileView = control.fileView;
        this.control = control;
        this.id = id;
        this.dst = dst;
    }


    /**
     * Executes the editor command.
     */
    public async execute(): Promise<void> {
        this.control.moveBreakout(this.id, this.dst);
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}
