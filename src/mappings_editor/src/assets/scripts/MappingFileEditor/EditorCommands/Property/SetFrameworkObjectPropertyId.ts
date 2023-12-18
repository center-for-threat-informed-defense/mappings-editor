import { EditorCommand, EditorDirectives } from "..";
import type { FrameworkObjectProperty } from "@/assets/scripts/MappingFile";

export class SetFrameworkObjectPropertyId extends EditorCommand {

    /**
     * The property's previous object id.
     */
    public readonly prevObjectId: string | null;

    /**
     * The property's previous object text.
     */
    public readonly prevObjectText: string | null;

    /**
     * True if the previous object value was cached, false otherwise.
     */
    public readonly prevWasCached: boolean;

    /**
     * The property's next object id.
     */
    public readonly nextObjectId: string | null;

    /**
     * The property.
     */
    public readonly prop: FrameworkObjectProperty;
    

    /**
     * Sets the object id of a {@link FrameworkObjectProperty}.
     * @param prop
     *  The {@link FrameworkObjectProperty}.
     * @param objectId
     *  The {@link FrameworkObjectProperty}'s new object id.
     */
    constructor(prop: FrameworkObjectProperty, objectId: string | null){
        super();
        this.prop = prop;
        this.prevObjectId = prop.objectId;
        this.prevObjectText = prop.objectText;
        this.prevWasCached = prop.isObjectValueCached();
        this.nextObjectId = objectId;
    }
    

    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    execute(): EditorDirectives {
        this.prop.objectId = this.nextObjectId;
        return EditorDirectives.Record | EditorDirectives.RebuildBreakouts;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    undo(): EditorDirectives {
        if(this.prevWasCached) {
            this.prop.cacheObjectValue(this.prevObjectId, this.prevObjectText);
        } else {
            if(!this.prop.setObjectValue(this.prevObjectId, this.prevObjectText)) {
                throw new Error("Object value was expected to be set without caching.")
            }
        }
        return EditorDirectives.RebuildBreakouts;
    }

}
