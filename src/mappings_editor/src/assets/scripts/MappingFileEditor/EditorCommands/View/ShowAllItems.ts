import { EditorCommand, EditorDirectives } from "..";
import type { FilterControl, MappingFileView } from "../..";

export class ShowAllItems extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

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
        this.fileView = control.fileView;
        this.control = control;
    }


    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        this.control.showAll();
        return EditorDirectives.None;
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
