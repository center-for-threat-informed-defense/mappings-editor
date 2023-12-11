import { GroupCommand } from "..";
import type { MappingFileEditor } from "../..";
import { UnselectViewItem } from "./UnselectViewItem";

export class UnselectAllViewItems extends GroupCommand {

    /**
     * Unselects all items within a {@link MappingFileEditor}.
     * @param editor
     *  The {@link MappingFileEditor}.
     */
    constructor(editor: MappingFileEditor){
        super();
        for(const item of editor.view.selected) {
            this.add(new UnselectViewItem(item));
        }
    }

}
