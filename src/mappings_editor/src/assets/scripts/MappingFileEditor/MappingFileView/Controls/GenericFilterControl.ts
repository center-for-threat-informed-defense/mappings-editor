import { FilterControl } from "./FilterControl";
import type { MappingFileView } from "..";

export class GenericFilterControl extends FilterControl {

    /**
     * The control's internal set of valid options.
     */
    private _options: Map<string | null, string>;


    /**
     * The control's set of valid options.
     */
    public get options(): ReadonlyMap<string | null, string> {
        return this._options;
    }

    /**
     * The control's number of valid options.
     */
    public get size(): number {
        return this._options.size;
    }

    
    /**
     * Creates a new {@link FilterControl}.
     * @param fileView
     *  The control's {@link MappingFileView}.
     * @param textKey
     *  The property (on each list item) that acts as the filter text.
     * @param options
     *  The control's valid set of options.
     */
    constructor(fileView: MappingFileView, options: Map<string | null, string>) {
        super(fileView);
        this._options = options;
    }

}
