import { EditorCommand } from ".";

export abstract class ViewObjectCommand extends EditorCommand {

    /**
     * The view object's id.
     */
    public readonly id: string;

    
    /**
     * Creates a new {@link ViewObjectCommand}.
     * @param id
     *  The view object's id.
     */
    constructor(id: string) {
        super();
        this.id = id;
    }

}
