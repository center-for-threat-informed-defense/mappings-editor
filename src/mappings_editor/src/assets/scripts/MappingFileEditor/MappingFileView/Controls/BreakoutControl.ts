import type { MappingFileView } from "..";

export class BreakoutControl {

    /**
     * The control's internal set of valid breakouts.
     */
    private _options: Map<number, { text: string, enabled: boolean }>;

    /**
     * The control's {@link MappingFileView}.
     */
    public readonly fileView: MappingFileView;


    /**
     * The control's set of valid breakouts.
     */
    public get options(): ReadonlyMap<number, Readonly<{ text: string, enabled: boolean }>> {
        return this._options;
    }

    /**
     * Returns the primary breakout.
     * @returns
     *  The primary breakout. `undefined` if there is no primary breakout.
     */
    public get primaryBreakout(): number | undefined {
        for(const [id, breakout] of this._options) {
            if(breakout.enabled) return id;
        }
        return undefined;
    }

    /**
     * Returns the active breakouts.
     * @returns
     *  The active breakouts.
     */
    public get activeBreakouts(): number[] {
        const breakouts = [];
        for(const [id, breakout] of this._options) {
            if(breakout.enabled) breakouts.push(id)
        }
        return breakouts;
    }


    /**
     * Creates a new {@link FilterControl}.
     * @param fileView
     *  The control's {@link MappingFileView}.
     * @param options
     *  The control's valid set of options.
     */
    constructor(fileView: MappingFileView, options: Map<number, { text: string, enabled: boolean }>) {
        this.fileView = fileView;
        this._options = options;
    }


    /**
     * Enables a breakout.
     * @param id
     *  The breakout's id.
     * @param value
     *  True to enable the breakout, false to disable it.
     */
    public setBreakoutState(id: number, value: boolean) {
        const breakout = this._options.get(id);
        if(breakout) {
            breakout.enabled = value;
        } else {
            throw new Error(`No breakout with id '${ id }'.`)
        }
    }

    /**
     * Moves a breakout to the specified index.
     * @param id
     *  The breakout's id.
     * @param dst
     *  The destination index.
     */
    public moveBreakout(id: number, dst: number) {
        const breakouts = [...this._options.entries()];
        const src = breakouts.findIndex(([_id]) => _id === id);
        if(src !== -1) {
            breakouts.splice(dst, 0, breakouts.splice(src, 1)[0]);
            this._options = new Map(breakouts);
        } else {
            throw new Error(`No breakout with id '${ id }'.`)
        }
    }

}
