import type { ListItemProperty } from "@/assets/scripts/MappingFile";
import { EditorCommand, EditorDirectives } from "..";

export class SetListItemProperty extends EditorCommand {

    /**
     * The property's previous value.
     */
    public readonly prevValue: string | null;

    /**
     * The property's previous export value.
     */
    public readonly prevExportValue: string | null;

    /**
     * The property's previous export text.
     */
    public readonly prevExportText: string | null;

    /**
     * True if the previous value was cached, false otherwise.
     */
    public readonly prevWasCached: boolean;

    /**
     * The property's next value.
     */
    public readonly nextValue: string | null;

    /**
     * The property.
     */
    public readonly prop: ListItemProperty;
    

    /**
     * Sets the value of a {@link ListItemProperty}.
     * @param prop
     *  The {@link ListItemProperty}.
     * @param value
     *  The {@link ListItemProperty}'s new value.
     */
    constructor(prop: ListItemProperty, value: string | null){
        super();
        this.prop = prop;
        this.prevValue = prop.value;
        this.prevExportValue = prop.exportValue;
        this.prevExportText = prop.exportText;
        this.prevWasCached = prop.isValueCached();
        if(value === null || this.prop.options.value.has(value)) {
            this.nextValue = value;
        } else {
            throw new Error(`Invalid list item value '${ value }'.`)
        }
    }
    

    /**
     * Executes the editor command.
     * @returns
     *  The command's directives.
     */
    execute(): EditorDirectives {
        this.prop.value = this.nextValue;
        return EditorDirectives.Record | EditorDirectives.RebuildBreakouts;
    }

    /**
     * Undoes the editor command.
     * @returns
     *  The command's directives.
     */
    undo(): EditorDirectives {
        if(this.prevWasCached) {
            this.prop.cacheValue(this.prevExportValue, this.prevExportText);
        } else {
            this.prop.value = this.prevValue;
        }
        return EditorDirectives.RebuildBreakouts;
    }

}
