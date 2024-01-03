export class EventEmitter<T extends Object> {
    
    /**
     * The event emitter's index of event listeners.
     */
    private _listeners: Map<string, Function[]>;

    
    /**
     * Creates a new {@link EventEmitter}. 
     */
    constructor(){
        this._listeners = new Map();
    }


    /**
     * Adds an event listener to an event.
     * @param event
     *  The name of the event.
     * @param callback
     *  The function to call when the event is raised.
     */
    public on<K extends keyof T>(event: K, callback: T[K]): void;
    public on(event: string, callback: Function) {
        if(!this._listeners.has(event))
            this._listeners.set(event, []);
        this._listeners.get(event)!.unshift(callback);
    }

    /**
     * Adds a one-time event listener to an event.
     * @param event
     *  The name of the event.
     * @param callback
     *  The function to call when the event is raised.
     */
    public once<K extends keyof T>(event: K, callback: T[K]): void;
    public once(event: string, callback: Function) {
        const once = (...args: any[]) => {
            const actions = this._listeners.get(event)!;
            actions.splice(actions.indexOf(once), 1);
            callback(...args);
        }
        if(!this._listeners.has(event))
            this._listeners.set(event, []);
        this._listeners.get(event)!.unshift(once);
    }

    /**
     * Dispatches the event listeners associated with a given event.
     * @param event
     *  The name of the event to raise.
     * @param args
     *  The arguments to pass to the event listeners.
     */
    protected emit<K extends keyof T>(event: K, ...args: any[]): void;
    protected emit(event: string, ...args: any[]) {
        if(this._listeners.has(event)) {
            const listeners = this._listeners.get(event)!;
            for(let i = listeners.length - 1; 0 <= i; i--) {
                listeners[i](...args);
            }
        }
    }

    /**
     * Removes all event listeners associated with a given event. If no event
     * name is specified, all event listeners are removed.
     * @param event
     *  The name of the event.
     */
    public removeAllListeners<K extends keyof T>(events?: K): void;
    public removeAllListeners(event?: string) {
        if(event !== undefined) {
            this._listeners.delete(event);
        } else {
            this._listeners.clear();
        }
    }

}
