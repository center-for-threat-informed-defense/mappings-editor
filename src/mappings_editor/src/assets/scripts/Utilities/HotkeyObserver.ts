///////////////////////////////////////////////////////////////////////////////
//  1. HotkeyObserver  ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export class HotkeyObserver<T> {

    /**
     * This map defines the evaluation order of modifier keys.
     */
    private static MODIFIER_KEYS = new Map<string, (e: KeyboardEvent) => Boolean>([
        ["control", e => e.ctrlKey],
        ["meta",    e => e.metaKey],
        ["alt",     e => e.altKey],
        ["shift",   e => e.shiftKey]
    ]);

    /**
     * The key down function, bound to the current object.
     */
    private _boundOnKeyDown: (e: KeyboardEvent) => void;

    /**
     * The key up function, bound to the current object.
     */
    private _boundOnKeyUp: (e: KeyboardEvent) => void;

    /**
     * The function to call when a hotkey sequence is matched.
     */
    private _callback: (command: T | undefined) => void;

    /**
     * The DOM element the hotkey observer is watching.
     */
    private _container: HTMLElement | null;

    /**
     * The hotkey observer's hotkey-id-to-item map.
     */
    private _hotkeyIdMap: Map<string, Hotkey<T>>;

    /**
     * The last observed key state.
     */
    private _keyState: string;


    /**
     * Creates a new {@link HotkeyObserver}.
     * @param callback
     *  The function to call once a hotkey sequence is triggered.
     */
    constructor(callback: (command: T | undefined) => void);

    /**
     * Creates a new {@link HotkeyObserver}.
     * @param callback
     *  The function to call once a hotkey sequence is triggered.
     * @param reactive
     *  A function which returns the reactive proxy of an object. If the
     *  {@link HotkeyObserver} needs to be reactive, this function should be
     *  specified.
     */
    constructor(
        callback: (command: T | undefined) => void,
        reactive?: <T extends object>(obj: T) => any);
    constructor(
        callback: (command: T | undefined) => void,
        reactive: <T extends object>(obj: T) => any = o => o
    ) {
        this._boundOnKeyDown = this.onKeyDown.bind(reactive(this));
        this._boundOnKeyUp = this.onKeyUp.bind(reactive(this));
        this._callback = callback;
        this._container = null;
        this._hotkeyIdMap = new Map();
        this._keyState = "";
    }


    /**
     * Binds the HotkeyObserver to an HTML element.
     * @param container
     *  The HTML element to bind to.
     */
    public observe(container: HTMLElement) {
        this._container = container;
        this._container.addEventListener("keydown", this._boundOnKeyDown);
        this._container.addEventListener("keyup", this._boundOnKeyUp);
    }

    /**
     * Unbinds the HotkeyObserver from the HTML element.
     */
    public disconnect() {
        this._container?.removeEventListener("keydown", this._boundOnKeyDown);
        this._container?.removeEventListener("keyup", this._boundOnKeyUp);
    }

    /**
     * Configures the hotkeys to listen for.
     * @param keyMap
     *  An array of hotkeys.
     * @throws { OverlappingHotkeysError }
     *  If any hotkey sequences overlap with each other.
     */
    public setHotkeys(keyMap: Hotkey<T>[]) {
        this._hotkeyIdMap = new Map<string, Hotkey<T>>();
        for (const item of keyMap) {
            if (item.shortcut === "") continue;
            // Derive hotkey id
            const hotkeyId = this.keySequenceToHotKeyId(item.shortcut);
            // Ensure hotkey id doesn't overlap with others 
            for (const id of this._hotkeyIdMap.keys()) {
                if (id.startsWith(hotkeyId) || hotkeyId.startsWith(id)) {
                    throw new OverlappingHotkeysError(
                        `Overlapping key sequences ('${
                            id
                        }' and '${
                            hotkeyId
                        }') are not allowed.`
                    );
                }
            }
            // Add hotkey
            this._hotkeyIdMap.set(hotkeyId, item);
        }
    }

    /**
     * Tests if a hotkey sequence is active.
     * @remarks
     *  Due to the inconsistent nature of the `keyup` event, this is not
     *  guaranteed to be correct. Refer to: `HotKeyObserver.onKeyUp()` for more
     *  information. This function will need to be refactored or deprecated in
     *  the future.
     * @param sequence
     *  The hotkey sequence.
     * @param strict
     *  [true]
     *   The active keys must match the provided hotkey sequence exactly.
     *  [false]
     *   The active keys only need to contain the provided hotkey sequence.
     *  (Default: true)
     * @returns
     *  True if the provided hotkey sequence is active, false otherwise.
     */
    public isHotkeyActive(sequence: string, strict: boolean = true): boolean {
        const id = this.keySequenceToHotKeyId(sequence);
        return strict ? this._keyState === id : this._keyState.includes(id);
    }

    /**
     * Key down behavior.
     * @param e
     *  The keydown event.
     */
    private onKeyDown(e: KeyboardEvent) {

        // If inside input field, ignore hotkeys
        if((e.target as any).tagName === "INPUT") {
            return;
        }

        // Advanced current key state
        const nextKeyState = this.keyEventToHotKeyId(e); 
        const isRepeat = this._keyState === nextKeyState;
        this._keyState = nextKeyState;

        // Check key state
        if (this._hotkeyIdMap.has(this._keyState)) {
            const hotkey = this._hotkeyIdMap.get(this._keyState)!;
            // If disabled or if in repeat state and hotkey is not repeatable:
            if(hotkey.disabled || (isRepeat && !hotkey.repeatable)) {
                // Prevent all browser behavior
                e.preventDefault();
                // Bail
                return;    
            }
            // Disable browser default behavior if not requested
            if (!hotkey.allowBrowserBehavior) {
                e.preventDefault();
            }
            // Execute shortcut
            this._callback(hotkey.data);
        } else {
            // If no key matched, block browser behavior by default
            e.preventDefault();
        }

    }

    /**
     * Key up behavior.
     * @remarks
     *  The `keyup` event will not fire in all cases. For example:
     * 
     *  - If a hotkey opens a separate window, there will be no `keyup` event.
     *  - If the Command key is held (on MacOS), any other `keyup` is ignored.
     *  - ...there are probably others.
     * 
     * For these reasons, do not rely on `keyup` events for critical
     * functionality (at least until these issues can be addressed somehow).
     * @param e
     *  The keyup event.
     */
    private onKeyUp(e: KeyboardEvent) {
        // Resolve next modifier keys state
        const nextKeyState = this.keyEventToHotKeyId(e).split(".");
        const lostKey = nextKeyState.splice(-2, 1)[0];
        // Resolve previous non-modifier
        const prevNonModifier = this._keyState.split(".").slice(-2)[0];
        // If lost key was non-modifier...
        if(lostKey === prevNonModifier) {
            // ...remove non-modifier.
            nextKeyState.push("");
        }
        // If lost key was anything else...
        else {
            // ...keep non-modifier.
            nextKeyState.push(prevNonModifier)
        }
        nextKeyState.push("");
        // Update key state
        this._keyState = nextKeyState.join(".");
    }

    /**
     * Converts a key sequence to its hotkey id.
     * @param sequence
     *  The sequence to evaluate.
     * @returns
     *  The sequence's hotkey id.
     * @throws {InvalidKeySequenceError}
     *  If the key sequence contains more than one non-modifier key.
     */
    private keySequenceToHotKeyId(sequence: string): string {
        let id = "";
        // Parse tokens
        const tokens = sequence
            .replace(/\s+/g, '')
            .toLocaleLowerCase()
            .split("+");
        // Order modifier keys
        for(const key of HotkeyObserver.MODIFIER_KEYS.keys()) {
            const index = tokens.findIndex(o => o === key);
            if(index !== -1) {
                id += `.${ tokens.splice(index, 1)[0] }`;
            }
        }
        // Resolve single non-modifier key
        if(0 === tokens.length) {
            id += `.`;
        }
        else if(2 <= tokens.length) {
            throw new InvalidKeySequenceError(
                `Hotkey contains ${ 
                    tokens.length
                } non-modifier keys (${
                    tokens.join(",")
            }).`);
        } else if(!HotkeyObserver.MODIFIER_KEYS.has(tokens[0])) {
            id += `.${ tokens[0] }`
        } else {
            throw new InvalidKeySequenceError(
                `Hotkey duplicate modifier key '${
                    tokens[0]
                }'.`
            );
        }
        // Return id
        return `${ id }.`;
    }

    /**
     * Converts a key event to its hotkey id.
     * @param event
     *  The keyboard event.
     * @returns
     *  The key event's hotkey id.
     */
    private keyEventToHotKeyId(event: KeyboardEvent): string {
        let id = ""
        // Parse modifier keys
        for(const [key, isKey] of HotkeyObserver.MODIFIER_KEYS) {
            if(isKey(event)) {
                id += `.${ key }`;
            }
        }
        // Parse key pressed
        const keyPressed = event.key.toLocaleLowerCase();
        if(!HotkeyObserver.MODIFIER_KEYS.has(keyPressed)) {
            id += `.${ keyPressed }`;
        } else {
            id += `.`;
        }
        // Return id
        return `${ id }.`;
    }

}

export class OverlappingHotkeysError extends Error {

    /**
     * Creates a new {@link OverlappingHotkeysError}.
     * @param message
     *  The error message.
     */
    constructor(message: string) {
        super(message);
    }

}

export class InvalidKeySequenceError extends Error {

    /**
     * Creates a new {@link InvalidKeySequenceError}.
     * @param message
     *  The error message.
     */
    constructor(message: string) {
        super(message);
    }

}


///////////////////////////////////////////////////////////////////////////////
//  2. Hotkey  ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


export interface Hotkey<T> {

    /**
     * The hotkey's shortcut.
     */
    shortcut: string

    /**
     * The hotkey's data.
     */
    data?: T

    /**
     * If the hotkey is repeatable.
     */
    repeatable: boolean

    /**
     * If the hotkey is disabled.
     */
    disabled?: boolean

    /**
     * If the browser's default behavior should be permitted.
     */
    allowBrowserBehavior?: boolean

}
