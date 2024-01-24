import { EditorCommand, EditorDirectives } from "..";
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
     * @returns
     *  The command's directives.
     */
    public execute(): EditorDirectives {
        return EditorDirectives.None;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    public undo(): EditorDirectives {
        if(this.views.length) {
            const file = this.views[0].fileView;
            for(const view of this.views) {
                file.restoreMappingObjectView(view);
            }
        }
        return EditorDirectives.None;
    }

}
