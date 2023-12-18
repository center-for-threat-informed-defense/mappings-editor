import { EditorCommand, EditorDirectives } from "..";
import type { FilterControl } from "../..";

export class SetFilterState extends EditorCommand {

    /**
     * The filter control.
     */
    public readonly control: FilterControl;

    /**
     * The filter's id.
     */
    public readonly id: string | null;

    /**
     * True to apply the filter, false to remove it.
     */
    public readonly value: boolean;


    /**
     * Applies/Removes a filter.
     * @param control
     *  The filter control.
     * @param id
     *  The filter's id.
     * @param value
     *  True to apply the filter, false to remove it.
     */
    constructor(control: FilterControl, id: string | null, value: boolean) {
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
        if(this.value) {
            this.control.show(this.id);
        } else {
            this.control.hide(this.id);
        }
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
