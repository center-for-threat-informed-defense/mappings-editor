import { FilterControl } from "./FilterControl";
import type { ListProperty } from "@/assets/scripts/MappingFile";

export class ListPropertyFilterControl extends FilterControl {

    /**
     * The property (on each list item) that acts as the filter text.
     */
    private _textKey: string;

    /**
     * The control's internal set of valid options.
     */
    private _options: ListProperty;


    /**
     * The control's set of valid options.
     */
    public get options(): ReadonlyMap<string | null, string> {
        // Compile options
        const options: [string | null, string][] = 
            [...this._options.value].map(
                ([id, o]) => [id, o.getAsString(this._textKey)]
            );
        // Add null option
        options.push([null, "No Value"]);
        // Return complete set of options
        return new Map(options)
    }

    
    /**
     * Creates a new {@link FilterControl}.
     * @param textKey
     *  The property (on each list item) that acts as the filter text.
     * @param options
     *  The control's valid set of options.
     */
    constructor(textKey: string, options: ListProperty) {
        super();
        this._textKey = textKey;
        this._options = options;
    }

}
