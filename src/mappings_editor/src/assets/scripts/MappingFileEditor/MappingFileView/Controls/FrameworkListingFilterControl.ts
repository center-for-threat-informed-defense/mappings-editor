import { FilterControl } from ".";
import type { FrameworkListing } from "@/assets/scripts/MappingFile";

export class FrameworkListingFilterControl extends FilterControl {

    /**
     * The control's internal set of valid options.
     */
    private _framework: FrameworkListing;


    /**
     * The control's set of valid options.
     */
    public get options(): ReadonlyMap<string, string> {
        const options = new Map();
        for(const value of this._framework.options.keys()) {
            if(value === null) {
                options.set(null, "No Value")
            } else {
                options.set(value, value);
            }
        }
        return options;
    }

    
    /**
     * Creates a new {@link FilterControl}.
     * @param valueKey
     *  The property (on each list item) that acts as the filter value.
     * @param textKey
     *  The property (on each list item) that acts as the filter text.
     * @param framework
     *  The control's valid set of options.
     */
    constructor(framework: FrameworkListing) {
        super();
        this._framework = framework;
    }

}
