import { ViewFilter } from "./ViewFilter";
import {
    ComputedProperty, FrameworkObjectProperty,
    ListItemProperty
} from "@/assets/scripts/MappingFile";
import {
    FilterControl, FrameworkListingFilterControl,
    GenericFilterControl, ListPropertyFilterControl
} from "../ViewControls";
import type { MappingFileView } from "../MappingFileView";
import type { MappingObject, Property } from "@/assets/scripts/MappingFile";
import type { MappingObjectPropertyKey } from "../MappingObjectPropertyKey";

export class ValueViewFilter extends ViewFilter {

    /**
     * The available filter controls.
     */
    public readonly controls: ReadonlyMap<MappingObjectPropertyKey, FilterControl>;


    /**
     * Creates a new {@link ValueViewFilter}.
     */
    constructor(view: MappingFileView) {
        super();
        const file = view.file;
        this.controls = new Map<MappingObjectPropertyKey, FilterControl>([
            [
                "capabilityGroup",
                new ListPropertyFilterControl(view, "name", file.capabilityGroups)
            ],
            [
                "mappingStatus",
                new ListPropertyFilterControl(view, "name", file.mappingStatuses)
            ],
            [
                "mappingType",
                new ListPropertyFilterControl(view, "name", file.mappingTypes)
            ],
            [
                "sourceObject",
                new FrameworkListingFilterControl(view, file.sourceFrameworkListing)
            ],
            [
                "targetObject",
                new FrameworkListingFilterControl(view, file.targetFrameworkListing)
            ],
            [
                "isValid",
                new GenericFilterControl(view, new Map([
                    ["true", "Valid"],
                    ["false", "Invalid"]
                ]))
            ]
        ]);
    }


    /**
     * Tests if a {@link Property} is visible.
     * @param key
     *  The property's {@link MappingObject} key.
     * @param property
     *  The property.
     * @returns
     *  True if the property is visible, false otherwise.
     */
    public isPropertyVisible(key: MappingObjectPropertyKey, prop: Property): boolean {
        // Select control
        const control = this.controls.get(key)
        // Check if all shown first to save time
        if(!control || control.allShown()) {
            return true;
        }
        // Check if value is shown
        if(prop instanceof FrameworkObjectProperty) {
            return control.isShown(prop.objectId);
        }
        if(
            prop instanceof ListItemProperty ||
            prop instanceof ComputedProperty
        ) {
            if(prop.value === null) {
                return control.isShown(prop.value);
            } else {
                return control.isShown(`${ prop.value }`)
            }
        }
        throw new Error(
            `Cannot dereference value from '${ prop.constructor.name }'.`
        );

    }

    /**
     * Tests if a {@link MappingObject} is visible.
     * @param object
     *  The mapping object.
     * @returns
     *  True if the mapping object is visible, false otherwise.
     */
    public isObjectVisible(object: MappingObject): boolean {
        let isVisible = true;
        for(const key of this.controls.keys()) {
            isVisible &&= this.isPropertyVisible(key, object[key]);
        }
        return isVisible;
    }

}
