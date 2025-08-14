import { EditorCommand } from "../EditorCommand";
import type { MappingFileView } from "@/assets/scripts/MappingFileView";

export class SetMappingFileViewHeight extends EditorCommand {

    /**
     * The mapping file view.
     */
    public readonly fileView: MappingFileView;

    /**
     * The view's height.
     */
    public readonly height: number;


    /**
     * Sets a {@link MappingFileView}'s view height.
     * @param fileView
     *  The mapping file view to operate on.
     * @param height
     *  The view's height (in pixels).
     */
    constructor(fileView: MappingFileView, height: number) {
        super();
        this.fileView = fileView;
        this.height = height;
    }


    /**
     * Executes the editor command.
     */
    public async execute(): Promise<void> {
        this.fileView.setViewHeight(this.height);
    }

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {}

}
