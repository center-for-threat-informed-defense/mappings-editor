import { EditorCommand } from "..";
import type { MappingObjectView } from "../..";

export class RestoreMappingObjectViews extends EditorCommand {

    /**
     * The mapping object view to restore.
     */
    public readonly views: MappingObjectView[];


    /**
     * Restores a {@link MappingObjectView} to its {@link MappingFileView}.
     * @param view
     *  The {@link MappingObjectView}.
     */
    constructor(views: MappingObjectView);

    /**
     * Restores a set of {@link MappingObjectView}s to their
     * {@link MappingFileView}.
     * @param views
     *  The {@link MappingObjectView}s.
     */
    constructor(views: MappingObjectView[]);
    constructor(views: MappingObjectView[] | MappingObjectView) {
        super();
        this.views = Array.isArray(views) ? views : [views];
    }


    /**
     * Executes the editor command.
     */
    public async execute(): Promise<void> {}

    /**
     * Undoes the editor command.
     */
    public async undo(): Promise<void> {
        if(this.views.length) {
            const file = this.views[0].fileView;
            for(const view of this.views) {
                file.restoreMappingObjectView(view);
            }
        }
    }

}
