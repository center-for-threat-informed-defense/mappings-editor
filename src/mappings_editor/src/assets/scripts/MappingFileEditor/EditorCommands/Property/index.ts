import { SetStringProperty } from "./SetStringProperty";
import { SetListItemProperty } from "./SetListItemProperty";
import { AddItemToListProperty } from "./AddItemToListProperty";
import { DeleteItemFromListProperty } from "./DeleteItemFromListProperty";
import { SetFrameworkObjectPropertyId } from "./SetFrameworkObjectPropertyId";
import { SetFrameworkObjectPropertyText } from "./SetFrameworkObjectPropertyText";
import { EnterDynamicFrameworkObjectProperty } from "./EnterDynamicFrameworkObjectProperty";
import { ExitDynamicFrameworkObjectProperty } from "./ExitDynamicFrameworkObjectProperty";
import type { EditorCommand } from "..";
import type { 
    DynamicFrameworkObjectProperty, FrameworkObjectProperty, 
    ListItem, ListItemProperty, ListProperty, StringProperty
} from "@/assets/scripts/MappingFile";

/**
 * Sets the value of a {@link StringProperty}.
 * @param prop
 *  The {@link StringProperty}.
 * @param value
 *  The {@link StringProperty}'s new value.
 * @returns
 *  A command that represents the action.
 */
export function setStringProperty(prop: StringProperty, value: string | null): EditorCommand {
    return new SetStringProperty(prop, value); 
}

/**
 * Sets the value of a {@link ListProperty}.
 * @param prop
 *  The {@link ListItemProperty}.
 * @param value
 *  The {@link ListItemProperty}'s new value.
 * @returns
 *  A command that represents the action.
 */
export function setListItemProperty(prop: ListItemProperty, value: string | null): EditorCommand;

/**
 * Sets the value of a {@link ListProperty}.
 * @param prop
 *  The {@link ListItemProperty}.
 * @param exportValue
 *  The {@link ListItemProperty}'s new export value.
 * @param exportText
 *  The {@link ListItemProperty}'s new export text.
 * @returns
 *  A command that represents the action.
 */
export function setListItemProperty(prop: ListItemProperty, exportValue: string, exportText?: string): EditorCommand;
export function setListItemProperty(prop: ListItemProperty, param1: string | null, param2?: string): EditorCommand {
    if(param1 === null || param2 === undefined) {
        return new SetListItemProperty(prop, param1); 
    } else {
        return new SetListItemProperty(prop, param1, param2); 
    }
}

/**
 * Sets the object id of a {@link FrameworkObjectProperty}.
 * @param prop
 *  The {@link FrameworkObjectProperty}.
 * @param objectId
 *  The {@link FrameworkObjectProperty}'s new object id.
 * @returns
 *  A command that represents the action.
 */
export function setFrameworkObjectPropertyId(prop: FrameworkObjectProperty, objectId: string | null): EditorCommand;

/**
 * Forcibly sets the object id and text of a {@link FrameworkObjectProperty}.
 * @param prop
 *  The {@link FrameworkObjectProperty}.
 * @param objectId
 *  The {@link FrameworkObjectProperty}'s new object id.
 * @param objectText
 *  The {@link FrameworkObjectProperty}'s new object text.
 * @returns
 *  A command that represents the action.
 */
export function setFrameworkObjectPropertyId(prop: FrameworkObjectProperty, objectId: string, objectText: string | null): EditorCommand;
export function setFrameworkObjectPropertyId(prop: FrameworkObjectProperty, objectId: string | null, objectText?: string | null): EditorCommand {
    if(objectId === null || objectText === undefined) {
        return new SetFrameworkObjectPropertyId(prop, objectId); 
    } else {
        return new SetFrameworkObjectPropertyId(prop, objectId, objectText); 
    }
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

/**
 * Adds a {@link ListItem} to a {@link ListProperty}.
 * @param prop
 *  The {@link ListProperty}.
 * @param value
 *  The {@link ListItem} to add.
 * @param index
 *  The index to insert the item at.
 * @returns
 *  A command that represents the action.
 */
export function addItemToListProperty(prop: ListProperty, item: ListItem, index?: number): EditorCommand {
    return new AddItemToListProperty(prop, item, index);
}

/**
 * Deletes a {@link ListItem} from a {@link ListProperty}.
 * @param prop
 *  The {@link ListProperty}.
 * @param value
 *  The {@link ListItem} to delete.
 * @returns
 *  A command that represents the action.
 */
export function deleteItemFromListProperty(prop: ListProperty, item: ListItem): EditorCommand {
    return new DeleteItemFromListProperty(prop, item);
}
