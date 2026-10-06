import {
  MappingObject,
  StringProperty,
  ListItemProperty,
} from "@/assets/scripts/MappingFile";
import { EditorCommand, type DirectiveIssuer } from "../..";
import type {
  MappingFileView,
  MappingFileViewItem,
} from "../../MappingFileView";
import * as EditorCommands from "../../EditorCommands";

export type MergeFieldSelection = {
  fieldKey: keyof MappingObject;
  sourceKey: keyof MappingObject;
  duplicateMappingId: string | undefined;
};

export class MergeMappingsObject extends EditorCommand {
  public readonly currentMapping: MappingObject;

  public readonly duplicateMappings: MappingObject[];

  public readonly fieldSelections: MergeFieldSelection[];
  /**
   * Uncollapses / Collapses a {@link MappingFileViewItem}.
   * @param item
   *  The view item to collapse.
   * @param value
   *  True to collapse the item, false to uncollapse the item.
   */
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
   */
  public async execute(): Promise<void> {
    // 1. For each field, copy the selected source value into the current mapping
    // 2. Delete the other duplicates
    // 3. Persist changes and hook into undo/redo

    console.log("Executing mergeMappings command with payload:", {
      currentMapping: this.currentMapping,
      duplicateMappings: this.duplicateMappings,
      fieldSelections: this.fieldSelections,
    });
    for (const selection of this.fieldSelections) {
      console.log(
        "field selection:",
        selection.fieldKey,
        selection.sourceKey,
        selection.duplicateMappingId,
      );
      // iterate over each field with a different value and apply the selected value to the current mapping
      if (selection.duplicateMappingId) {
        const duplicateMapping = this.duplicateMappings.find(
          (mapping) => mapping.id === selection.duplicateMappingId,
        );
        if (duplicateMapping) {
          const currentProp = this.currentMapping[selection.fieldKey];
          const duplicateProp = duplicateMapping[selection.sourceKey];

          if (
            currentProp instanceof StringProperty &&
            duplicateProp instanceof StringProperty
          ) {
            await EditorCommands.setStringProperty(
              currentProp,
              duplicateProp.value,
            ).execute();
          } else if (
            currentProp instanceof ListItemProperty &&
            duplicateProp instanceof ListItemProperty
          ) {
            // Handle null exportValue by using the 2-parameter overload
            if (duplicateProp.exportValue === null) {
              await EditorCommands.setListItemProperty(
                currentProp,
                null,
              ).execute();
            } else {
              // Use the 3-parameter overload for non-null exportValue
              const exportText = duplicateProp.exportText ?? undefined;
              await EditorCommands.setListItemProperty(
                currentProp,
                duplicateProp.exportValue,
                exportText,
              ).execute();
            }
          } else {
            // Fallback to the original behavior? Or log an error?
            console.warn(
              `Unsupported property type for field ${selection.fieldKey}`,
            );
          }
        }
      }
    }
    // Delete the duplicate mappings after merging their selected values
    for (const duplicateMapping of this.duplicateMappings) {
      console.log("Deleting duplicate mapping:", duplicateMapping.id);
      await EditorCommands.deleteMappingObject(duplicateMapping).execute();
    }
    console.log("MergeMappingsObject command executed successfully.");
    // Todo: reindex mappings file to display changes
  }
  /**
   * Undoes the editor command.
   */
  public async undo(): Promise<void> {
    // add back deleted duplicates and restore their original values
    for (const duplicateMapping of this.duplicateMappings) {
      console.log("Restoring duplicate mapping:", duplicateMapping.id);
      await EditorCommands.createMappingObject(duplicateMapping).execute();
    }
  }
}
