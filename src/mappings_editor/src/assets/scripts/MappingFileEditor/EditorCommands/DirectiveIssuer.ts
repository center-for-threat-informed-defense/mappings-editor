import type { EditorDirective } from ".";

export type DirectiveIssuer = (directives: EditorDirective, obj?: string) => void; 