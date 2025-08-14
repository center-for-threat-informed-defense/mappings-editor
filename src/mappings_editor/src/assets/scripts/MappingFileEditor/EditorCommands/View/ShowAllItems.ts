import { EditorCommand } from "../EditorCommand";
import type { FilterControl, MappingFileView } from "@/assets/scripts/MappingFileView";

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
     */
    public async execute(): Promise<void> {
        this.control.showAll();
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}
