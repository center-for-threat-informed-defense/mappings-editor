import { EditorDirective, type DirectiveIssuer, EditorCommand } from "../..";

export class ReindexMappingObjects extends EditorCommand {

    /**
     * The mapping objects, specified by id.
     */
    public readonly ids: string[];


    /**
     * Reindexes a mapping object.
     * @remarks
     *  Ideally, a user of the MappingFileEditor library wouldn't have to
     *  explicity command the editor to reindex a mapping object when it
     *  changes. This operation should be accomplished implicitly when a
     *  mapping file is altered. In time, the existing libraries will be
     *  refactored to enable this behavior. This command may be deprecated in
     *  the future.
     * @param ids
     *  The mapping object's id.
     */
    constructor(ids: string);

    /**
     * Reindexes a set of mapping objects.
     * @remarks
     *  Ideally, a user of the MappingFileEditor library wouldn't have to
     *  explicity command the editor to reindex a mapping object when it
     *  changes. This operation should be accomplished implicitly when a
     *  mapping file is altered. In time, the existing libraries will be
     *  refactored to enable this behavior. This command may be deprecated in
     *  the future.
     * @param ids
     *  The mapping objects, specified by id.
     */
    constructor(ids: string[]);
    constructor(ids: string[] | string) {
        super();
        this.ids = Array.isArray(ids) ? ids : [ids];
    }


    /**
     * Executes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        for(const id of this.ids) {
            issueDirective(EditorDirective.Reindex, id);
        }
    }

    /**
     * Undoes the editor command.
     * @param issueDirective
     *  A function that can issue one or more editor directives.
     */
    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        for(const id of this.ids) {
            issueDirective(EditorDirective.Reindex, id);
        }
    }

}
