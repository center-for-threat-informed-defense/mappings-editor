import { EditorCommand } from "../EditorCommand";
import type { FilterControl, MappingFileView } from "@/assets/scripts/MappingFileView";

export class SetFilterState extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

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
        this.fileView = control.fileView;
        this.control = control;
        this.id = id;
        this.value = value;
    }


    /**
     * Executes the editor command.
     */
    public async execute(): Promise<void> {
        if(this.value) {
            this.control.show(this.id);
        } else {
            this.control.hide(this.id);
        }
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}
