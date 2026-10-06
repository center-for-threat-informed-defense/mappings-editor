import type { ApplicationStore } from "@/stores/ApplicationStore";
import { AppCommand } from "../AppCommand";
import { checkDuplicateMappings } from "@/assets/scripts/MappingFile/CheckDuplicateMappings";
import { EditorDirective } from "@/assets/scripts/MappingFileEditor";

export class CheckForDuplicates extends AppCommand {
  private context: ApplicationStore;

  /**
   * Checks the loaded mappings file for duplicate mappings.
   * @param context
   *  The application context.
   */
  constructor(context: ApplicationStore) {
    super();
    this.context = context;
  }

  /**
   * Executes the command.
   */
  public async execute(): Promise<void> {
    const editor = this.context.activeEditor;
    checkDuplicateMappings(editor.file);
    editor.executeDirectives({
      directives: EditorDirective.Reindex | EditorDirective.RefreshView | EditorDirective.Autosave,
      reindexObjects: [...editor.file.mappingObjects.keys()],
    });
  }
}
