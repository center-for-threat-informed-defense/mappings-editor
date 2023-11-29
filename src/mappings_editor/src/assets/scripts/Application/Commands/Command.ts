import type { AppCommand } from "..";
import type { EditorCommand } from "../../MappingsFileEditor";

export type Command
    = AppCommand | EditorCommand;

export type CommandEmitter 
    = () => Promise<Command> | Command;
