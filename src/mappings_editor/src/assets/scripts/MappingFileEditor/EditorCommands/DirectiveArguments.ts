import type { EditorDirective } from ".";

export type DirectiveArguments = {
   
   /**
    * The editor directives.
    */
   directives: EditorDirective,

   /**
    * The objects to index.
    */
   reindexObjects: string[];

}
