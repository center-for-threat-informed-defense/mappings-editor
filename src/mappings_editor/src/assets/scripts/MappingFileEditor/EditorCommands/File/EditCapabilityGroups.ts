import type { ApplicationStore } from "@/stores/ApplicationStore";
import type { DirectiveIssuer } from "../DirectiveIssuer";
import { EditorCommand } from "../EditorCommand";


export class EditCapabilityGroups extends EditorCommand {
    private context: ApplicationStore
    
    constructor(context: ApplicationStore) {
        super();
        this.context = context;
    }


    public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
        const editedGroups = await this.context.askEditCapabilityGroups();
        console.log('TODO: Use this', editedGroups);
    }

    public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {

    }
}