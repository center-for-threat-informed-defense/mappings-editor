export class FileRecoveryBank {

    /**
     * The recovery bank's local storage prefix.
     */
    private static PREFIX = "file_recovery_bank."


    /**
     * The recovered file list.
     */
    public files: Map<string, { name: string, date: Date, contents: string }>;


    /**
     * Creates a {@link FileRecoveryBank}.
     */
    constructor() {
        this.files = new Map();
        for(let i = 0; i < localStorage.length; i++) {
            // Look up key
            const key = localStorage.key(i)!;
            if(!key.startsWith(FileRecoveryBank.PREFIX)) {
                continue;
            }
            // Parse id
            const id = key.substring(FileRecoveryBank.PREFIX.length);
            const value = JSON.parse(localStorage.getItem(key)!);
            // Parse value
            value.date = new Date(value.date)
            this.files.set(id, value);
        }
        this.sortStore();
    }


    /**
     * Stores or updates a file in the bank.
     * @param id
     *  The file's id.
     * @param name
     *  The file's name.
     * @param contents
     *  The file's contents.
     */
    public storeOrUpdateFile(id: string, name: string, contents: string) {
        const key = `${ FileRecoveryBank.PREFIX }${ id }`;
        const value = {
            name     : name,
            date     : new Date(),
            contents : contents
        };
        // Store file
        this.files.set(id, value);
        // Mirror to local storage
        localStorage.setItem(key, JSON.stringify(value));
        // Resort store
        this.sortStore();
    }

    /**
     * Withdraws a file from the bank.
     * @param id
     *  The id of the file to withdraw.
     */
    public withdrawFile(id: string) {
        const key = `${ FileRecoveryBank.PREFIX }${ id }`;
        if(localStorage.getItem(key) !== null) {
            // Withdraw file
            this.files.delete(id);
            // Mirror to local storage
            localStorage.removeItem(key);
        }
    }

    /**
     * Sorts the file editor bank in reverse chronological order.
     */
    private sortStore() {
        this.files = new Map(
            [...this.files].sort(
                (a, b) => b[1].date.getTime() - a[1].date.getTime()
            )
        );
    }

}
