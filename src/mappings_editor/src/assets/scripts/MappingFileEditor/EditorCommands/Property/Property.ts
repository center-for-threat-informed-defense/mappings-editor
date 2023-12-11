import { SetListItemProperty } from "./SetListItemProperty";
import { SetFrameworkObjectPropertyId } from "./SetFrameworkObjectPropertyId";
import { SetFrameworkObjectPropertyText } from "./SetFrameworkObjectPropertyText";
import type { EditorCommand } from "..";
import type { DynamicFrameworkObjectProperty, FrameworkObjectProperty, ListItemProperty } from "@/assets/scripts/MappingFile";
import { EnterDynamicFrameworkObjectProperty } from "./EnterDynamicFrameworkObjectProperty";
import { ExitDynamicFrameworkObjectProperty } from "./ExitDynamicFrameworkObjectProperty";

/**
 * Sets the value of a {@link ListProperty}.
 * @param prop
 *  The {@link ListItemProperty}.
 * @param value
 *  The {@link ListItemProperty}'s new value.
 * @returns
 *  A command that represents the action.
 */
export function setListItemProperty(prop: ListItemProperty, value: string | null): EditorCommand {
   return new SetListItemProperty(prop, value); 
}

/**
 * Sets the object id of a {@link FrameworkObjectProperty}.
 * @remarks
 *  Prefer {@link setDynamicFrameworkObjectPropertyId} when setting the object
 *  id of {@link DynamicFrameworkObjectProperty}s.
 * @param prop
 *  The {@link FrameworkObjectProperty}.
 * @param objectId
 *  The {@link FrameworkObjectProperty}'s new object id.
 * @returns
 *  A command that represents the action.
 */
export function setFrameworkObjectPropertyId(prop: FrameworkObjectProperty, objectId: string | null): EditorCommand {
    return new SetFrameworkObjectPropertyId(prop, objectId); 
}

/**
 * Sets the object text of a {@link FrameworkObjectProperty}.
 * @param prop
 *  The {@link FrameworkObjectProperty}.
 * @param objectText
 *  The {@link FrameworkObjectProperty}'s new object text.
 * @returns
 *  A command that represents the action.
 */
export function setFrameworkObjectPropertyText(prop: FrameworkObjectProperty, objectText: string | null): EditorCommand {
    return new SetFrameworkObjectPropertyText(prop, objectText); 
}

/**
 * Enters a {@link DynamicFrameworkObjectProperty}.
 * @param prop
 *  The {@link DynamicFrameworkObjectProperty}.
 * @returns
 *  A command that represents the action.
 */
export function enterDynamicFrameworkObjectProperty(prop: DynamicFrameworkObjectProperty): EditorCommand {
    return new EnterDynamicFrameworkObjectProperty(prop);
}

/**
 * Exits a {@link DynamicFrameworkObjectProperty}.
 * @param prop
 *  The {@link DynamicFrameworkObjectProperty}.
 * @returns
 *  A command that represents the action.
 */
export function exitDynamicFrameworkObjectProperty(prop: DynamicFrameworkObjectProperty): EditorCommand {
    return new ExitDynamicFrameworkObjectProperty(prop);
}
