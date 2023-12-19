export class AutosaveTimer<T> {

    /**
     * The amount of time to wait before autosaving (in milliseconds).
     */
    public readonly interval: number;

    /**
     * The save actions.
     */
    private _actions: Map<string, { tId: number, obj: T, save: (obj: T) => void }>;


    /**
     * Creates a new {@link AutosaveTimer}.
     * @param interval
     *  The amount of time to wait before autosaving (in milliseconds).
     */
    constructor(interval: number) {
        this.interval = interval;
        this._actions = new Map();
    }


    /**
     * Requests a save.
     * @param id
     *  The object's identifier.
     * @param obj
     *  The object to save.
     * @param save
     *  The save action. 
     */
    public requestSave(id: string, obj: T, save: (obj: T) => void) {
        // Create action
        if(!this._actions.has(id)) {
            this._actions.set(id, { tId: 0, obj, save })
        }
        // Update action
        const action = this._actions.get(id)!
        action.obj = obj;
        action.save = save;
        // Hold save
        this.delayAutosave(id);
    }

    /**
     * Temporarily withholds all save actions.
     */
    public delayAutosave(): void;

    /**
     * Temporarily withholds a save action.
     * @param id
     *  The object's identifier.
     */
    public delayAutosave(id?: string): void;
    public delayAutosave(id?: string) {
        // If no id specified...
        if(!id) {
            // ...withhold all save actions
            for(const id of this._actions.keys()) {
                this.delayAutosave(id);
            }
            return;
        }
        // If id specified...
        const action = this._actions.get(id);
        if(!action) {
            return;
        }
        // ...withhold save action
        clearTimeout(action.tId);
        action.tId = setTimeout(() => {
            action.save(action.obj);
            this._actions.delete(id);
        }, this.interval);
    }

    /**
     * Cancels all outstanding save actions.
     */
    public cancelAutosave(id?: string): void;

    /**
     * Cancels an outstanding save action.
     * @param id
     *  The object's identifier.
     */
    public cancelAutosave(id?: string): void;
    public cancelAutosave(id: string) {
        // If no id specified...
        if(!id) {
            // ...cancel all save actions
            for(const id of this._actions.keys()) {
                this.cancelAutosave(id);
            }
            return;
        }
        // If id specified...
        const action = this._actions.get(id);
        if(!action) {
            return;
        }
        // ...cancel save action
        clearTimeout(action.tId);
        this._actions.delete(id);
    }

}
