import { EditorCommand, EditorDirectives } from "..";
import type { FilterControl } from "../..";

export class ShowAllItems extends EditorCommand {

    /**
     * The filter control.
     */
    public readonly control: FilterControl;


    /**
     * Shows all items under a filter.
     * @param control
     *  The filter control.
     */
    constructor(control: FilterControl) {
        super();
        this.control = control;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.control.showAll();
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