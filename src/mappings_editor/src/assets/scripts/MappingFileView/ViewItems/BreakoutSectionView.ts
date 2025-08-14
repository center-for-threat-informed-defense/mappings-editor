import { randomUUID } from "@/assets/scripts/Utilities";
import { EditorCommand } from "../../MappingFileEditor";
import { MappingFileViewItem } from ".";
import type { MappingObject } from "@/assets/scripts/MappingFile";
import type { MappingFileView } from "..";

export abstract class BreakoutSectionView extends MappingFileViewItem {

    /**
     * The section's internal id.
     */
    private readonly _id: string;

    /**
     * The item's hang offset.
     */
    public hangOffset: number;

    /**
     * The item's hang height.
     */
    public hangHeight: number;

    /**
     * The section's name.
     */
    public name: string;

    /**
     * The section's value.
     */
    public value: null | string;


    /**
     * The section's id.
     */
    public get id(): string {
        return this._id;
    }


    /**
     * Creates a new {@link BreakoutSectionView}.
     * @param file
     *  The mapping file view the item belongs to.
     * @param name
     *  The section's name.
     * @param value
     *  The sections' value.
     */
    constructor(file: MappingFileView, name: string, value: null | string) {
        super(file);
        this._id = randomUUID();
        this.baseOffset = 0;
        this.hangOffset = 0;
        this.hangHeight = 0;
        this.name = name;
        this.value = value;
        this.collapsed = false;
    }


    /**
     * Returns an {@link EditorCommand} that applies the section view's value
     * to the specified {@link MappingObject}.
     * @param obj
     *  The {@link MappingObject}.
     * @returns
     *  The {@link EditorCommand}.
     */
    public abstract applySectionValue(obj: MappingObject): EditorCommand;

}
