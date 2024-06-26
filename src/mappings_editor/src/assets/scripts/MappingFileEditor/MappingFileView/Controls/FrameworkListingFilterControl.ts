import { FilterControl } from ".";
import type { MappingFileView } from "..";
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
        let options = new Map();
        for(const [value, text] of this._framework.options) {
            if(value === null) {
                continue;
            } else {
                options.set(value, `${ value }: ${ text }`);
            }
        }
        options = new Map(
            [...options].sort((a,b) => a[1].localeCompare(b[1]))
        )
        options.set(null, "No Value")
        return options;
    }

    /**
     * The control's number of valid options.
     */
    public get size(): number {
        return this._framework.options.size;
    }

    
    /**
     * Creates a new {@link FilterControl}.
     * @param fileView
     *  The control's {@link MappingFileView}.
     * @param framework
     *  The control's valid set of options.
     */
    constructor(fileView: MappingFileView, framework: FrameworkListing) {
        super(fileView);
        this._framework = framework;
    }

}
