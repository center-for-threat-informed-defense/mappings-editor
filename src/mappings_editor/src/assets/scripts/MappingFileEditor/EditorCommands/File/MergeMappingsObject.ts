import {
  MappingObject,
  StringProperty,
  ListItemProperty,
  ListProperty,
} from "@/assets/scripts/MappingFile";
import { EditorCommand, EditorDirective, GroupCommand, type DirectiveIssuer } from "../..";
import * as EditorCommands from "../../EditorCommands";
import { checkDuplicateMappings } from "@/assets/scripts/MappingFile/CheckDuplicateMappings";

export type MergeFieldSelection = {
  fieldKey: keyof MappingObject;
  sourceKey: keyof MappingObject;
  duplicateMappingId: string | undefined;
  combineReferences?: boolean;
};

export class MergeMappingsObject extends EditorCommand {
  public readonly currentMapping: MappingObject;

  public readonly duplicateMappings: MappingObject[];

  public readonly fieldSelections: MergeFieldSelection[];
  private commands: GroupCommand | undefined;

  /** Creates an undoable merge of the selected fields and duplicate mappings. */
  constructor(
    currentMapping: MappingObject,
    duplicateMappings: MappingObject[],
    fieldSelections: MergeFieldSelection[],
  ) {
    super();
    this.currentMapping = currentMapping;
    this.duplicateMappings = duplicateMappings;
    this.fieldSelections = fieldSelections;
  }

  /**
   * Executes the editor command.
   * @param issueDirective
   *  A function that can issue one or more editor directives.
   */
  public async execute(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
    if (!this.commands) {
      this.commands = this.buildCommands();
    }
    await this.commands.execute(issueDirective);
    this.refreshProblems(issueDirective);
  }

  private buildCommands(): GroupCommand {
    const commands = new GroupCommand();
    for (const selection of this.fieldSelections) {
      const currentProp = this.currentMapping[selection.fieldKey];
      if (selection.fieldKey === "references" && selection.combineReferences) {
        const seen = new Set<string>();
        for (const mapping of [this.currentMapping, ...this.duplicateMappings]) {
          for (const item of mapping.references.value.values()) {
            const url = item.getAsString("url");
            if (!seen.has(url)) {
              seen.add(url);
              commands.do(EditorCommands.addItemToListProperty(this.currentMapping.references, item.duplicate()));
            }
          }
        }
        // Remove the originals after capturing independent copies of the combined list.
        for (const item of this.currentMapping.references.value.values()) {
          commands.do(EditorCommands.deleteItemFromListProperty(this.currentMapping.references, item));
        }
        continue;
      }
      if (!selection.duplicateMappingId) {
        continue;
      }
      const duplicateMapping = this.duplicateMappings.find(
        mapping => mapping.id === selection.duplicateMappingId
      );
      if (!duplicateMapping) {
        continue;
      }
      const duplicateProp = duplicateMapping[selection.sourceKey];
      if (currentProp instanceof StringProperty && duplicateProp instanceof StringProperty) {
        commands.do(EditorCommands.setStringProperty(currentProp, duplicateProp.value));
      } else if (currentProp instanceof ListItemProperty && duplicateProp instanceof ListItemProperty) {
        commands.do(duplicateProp.exportValue === null
          ? EditorCommands.setListItemProperty(currentProp, null)
          : EditorCommands.setListItemProperty(currentProp, duplicateProp.exportValue, duplicateProp.exportText ?? undefined));
      } else if (currentProp instanceof ListProperty && duplicateProp instanceof ListProperty) {
        for (const item of currentProp.value.values()) {
          commands.do(EditorCommands.deleteItemFromListProperty(currentProp, item));
        }
        for (const item of duplicateProp.value.values()) {
          commands.do(EditorCommands.addItemToListProperty(currentProp, item.duplicate()));
        }
      } else {
        throw new Error(`Unsupported property type for field ${selection.fieldKey}`);
      }
    }
    commands.do(EditorCommands.deleteMappingObjects(this.duplicateMappings));
    return commands;
  }

  private refreshProblems(issueDirective: DirectiveIssuer): void {
    const file = this.currentMapping.file;
    if (file !== null) {
      checkDuplicateMappings(file);
      for (const mapping of file.mappingObjects.values()) {
        issueDirective(EditorDirective.Reindex, mapping.id);
      }
    }
    issueDirective(EditorDirective.RefreshView);
  }
  /**
   * Undoes the editor command.
   * @param issueDirective
   *  A function that can issue one or more editor directives.
   */
  public async undo(issueDirective: DirectiveIssuer = () => {}): Promise<void> {
    // add back deleted duplicates and restore their original values
    for (const duplicateMapping of this.duplicateMappings) {
      if (duplicateMapping.file !== null) {
        await EditorCommands.createMappingObject( duplicateMapping.file).execute(issueDirective);
      }
    }
  }
}
