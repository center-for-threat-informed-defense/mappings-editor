import { EventEmitter } from "./EventEmitter";
import {
  GroupCommand,
  EditorCommand,
  MappingFileView,
  EditorDirective,
  type DirectiveIssuer,
  type DirectiveArguments,
} from ".";
import {
  EditableStrictFrameworkListing,
  MappingFile,
  MappingObject,
  StrictFrameworkObjectProperty,
  StringProperty,
} from "../MappingFile";
import FlexSearch from "flexsearch";
import type { MappingObjectDocument } from "./MappingObjectDocumentTypes";

export class MappingFileEditor extends EventEmitter<MappingFileEditorEvents> {
  /**
   * The phantom mappings editor.
   */
  public static Phantom: MappingFileEditor = new this(this.createPhantomPage());

  /**
   * The editor's id.
   */
  public readonly id: string;

  /**
   * The editor's file.
   */
  public readonly file: MappingFile;

  /**
   * The editor's file name.
   */
  public readonly name: string;

  /**
   * The editor's file view.
   */
  public readonly view: MappingFileView;

  /**
   * The editor's search index.
   */
  public searchIndex: MappingObjectDocument;

  /**
   * The editor's undo stack.
   */
  private _undoStack: EditorCommand[];

  /**
   * The editor's redo stack.
   */
  private _redoStack: EditorCommand[];

  /**
   * The editor's autosave interval.
   */
  private _autosaveInterval: number;

  /**
   * The editor's autosave timeout id.
   */
  private _autosaveTimeoutId: number | null;

  /**
   * The last time the editor autosaved.
   */
  private _lastAutosave: Date | null;

  /**
   * The editor's invalid mapping objects.
   */
  private readonly _invalidObjects: Set<string>;

  /**
   * The last time the editor autosaved.
   * @remarks
   *  `null` indicates the editor has not autosaved.
   *  `Invalid Date` indicates the editor failed to autosave.
   */
  public get lastAutosave(): Date | null {
    return this._lastAutosave;
  }

  /**
   * The editor's invalid mapping objects.
   */
  public get invalidObjects(): ReadonlySet<string> {
    return this._invalidObjects;
  }

  /**
   * Creates a new {@link MappingFileEditor}.
   * @param file
   *  The Mapping File.
   */
  constructor(file: MappingFile);

  /**
   * Creates a new {@link MappingFileEditor}.
   * @param file
   *  The Mapping File.
   * @param name
   *  The Mapping File's name.
   * @param autosaveInterval
   *  How long a period of inactivity must be before autosaving.
   *  (Default: 1500ms)
   */
  constructor(file: MappingFile, name?: string, autosaveInterval?: number);
  constructor(
    file: MappingFile,
    name?: string,
    autosaveInterval: number = 1500
  ) {
    super();
    this.id = file.id;
    this.name =
      name ??
      `${file.sourceFramework}@${file.sourceVersion}_${file.targetFramework}@${file.targetVersion}`;
    this.file = file;
    this.view = new MappingFileView(this.file, {
      sectionHeight: 33,
      sectionPaddingHeight: 10,
      objectHeightCollapsed: 42,
      objectHeightUncollapsed: 328,
      objectPaddingHeight: 6,
      loadMargin: 0,
    });
    this.searchIndex = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ["target_object_id", "target_object_text", "source_object_id", "source_object_text", "comments"],
      },
    });
    this._undoStack = [];
    this._redoStack = [];
    this._autosaveInterval = autosaveInterval;
    this._autosaveTimeoutId = null;
    this._lastAutosave = null;
    this._invalidObjects = new Set();
    this.reindexFile();
  }

  ///////////////////////////////////////////////////////////////////////////
  //  1. Command Execution  /////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  /**
   * Executes one or more editor commands.
   * @param commands
   *  The commands.
   * @returns
   *  The command directives.
   */
  public execute(...commands: EditorCommand[]) {
    // Package command
    let cmd: EditorCommand;
    if (commands.length === 0) {
      return;
    } else if (commands.length === 1) {
      cmd = commands[0];
    } else {
      const grp = new GroupCommand();
      for (const command of commands) {
        grp.do(command);
      }
      cmd = grp;
    }
    // Construct arguments
    const { args, issuer } = this.newDirectiveArguments();
    // Execute command
    cmd.execute(issuer);
    if (args.directives & EditorDirective.Record) {
      this._redoStack = [];
      this._undoStack.push(cmd);
    }
    this.executeDirectives(args);
  }

  /**
   * Creates a new set of {@link DirectiveArguments}.
   * @returns
   *  A new set of {@link DirectiveArguments} and a function which can issue
   *  updates to the arguments.
   */
  private newDirectiveArguments(): {
    args: DirectiveArguments;
    issuer: DirectiveIssuer;
  } {
    // Create arguments
    const args: DirectiveArguments = {
      directives: EditorDirective.None,
      reindexObjects: [],
    };
    // Create append arguments function
    const issuer = (dirs: EditorDirective, obj?: string) => {
      // Update directives
      args.directives = args.directives | dirs;
      // Update items to reindex
      if (dirs & EditorDirective.Reindex && obj) {
        args.reindexObjects.push(obj);
      }
    };
    return { args, issuer };
  }

  /**
   * Executes a command's {@link DirectiveArguments}.
   * @param args
   *  The arguments.
   */
  public executeDirectives(args: DirectiveArguments) {
    // Request autosave
    if (args.directives & EditorDirective.Autosave) {
      this.requestAutosave();
    }
    // Update reindex file
    if (args.directives & EditorDirective.Reindex) {
      this.reindexFile(args.reindexObjects);
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  //  2. File History  //////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  /**
   * Undoes the last editor command.
   */
  public undo() {
    if (this._undoStack.length) {
      // Construct arguments
      const { args, issuer } = this.newDirectiveArguments();
      // Execute undo
      const cmd = this._undoStack[this._undoStack.length - 1];
      cmd.undo(issuer);
      this._redoStack.push(this._undoStack.pop()!);
      this.executeDirectives(args);
    }
  }

  /**
   * Tests if the last command can be undone.
   * @returns
   *  True if the last command can be undone, false otherwise.
   */
  public canUndo(): boolean {
    return 0 < this._undoStack.length;
  }

  /**
   * Redoes the last undone editor command.
   */
  public redo() {
    if (this._redoStack.length) {
      // Construct arguments
      const { args, issuer } = this.newDirectiveArguments();
      // Execute redo
      const cmd = this._redoStack[this._redoStack.length - 1];
      cmd.redo(issuer);
      this._undoStack.push(this._redoStack.pop()!);
      this.executeDirectives(args);
    }
  }

  /**
   * Tests if the last undone command can be redone.
   * @returns
   *  True if the last undone command can be redone, false otherwise.
   */
  public canRedo(): boolean {
    return 0 < this._redoStack.length;
  }

  ///////////////////////////////////////////////////////////////////////////
  //  3. Autosave  //////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  /**
   * Requests a save.
   */
  private requestAutosave() {
    if (this._autosaveTimeoutId !== null) {
      clearTimeout(this._autosaveTimeoutId);
    }
    this._autosaveTimeoutId = setTimeout(() => {
      this._autosaveTimeoutId = null;
      try {
        this.emit("autosave", this);
        this._lastAutosave = new Date();
      } catch (ex) {
        this._lastAutosave = new Date(Number.NaN);
        console.error("Failed to autosave:");
        console.error(ex);
      }
    }, this._autosaveInterval);
  }

  /**
   * Temporarily withholds an outstanding save action (if one exists).
   */
  public tryDelayAutosave(): void {
    if (this._autosaveTimeoutId !== null) {
      this.requestAutosave();
    }
  }

  /**
   * Cancels an outstanding save action (if one exists).
   */
  public tryCancelAutosave() {
    if (this._autosaveTimeoutId !== null) {
      clearTimeout(this._autosaveTimeoutId);
      this._autosaveTimeoutId = null;
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  //  4. Indexing  //////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  /**
   * Reindexes the {@link MappingFile}.
   */
  public reindexFile(): void;

  /**
   * Reindexes one or more {@link MappingObject}s in the {@link MappingFile}.
   * @param ids
   *  The mapping objects, specified by id, to reindex.
   */
  public reindexFile(ids: string[]): void;
  public reindexFile(ids?: string[]) {
    // Collect objects
    const objects = [];
    if (ids) {
      objects.push(...ids);
    } else {
      objects.push(...this.file.mappingObjects.keys());
      this._invalidObjects.clear();
    }
    // Index objects
    for (const id of objects) {
      const obj = this.file.mappingObjects.get(id);
      // If object no longer exists...
      if (!obj) {
        this._invalidObjects.delete(id);
        // remove from search index if no longer exists
        this.searchIndex.remove(id)
        continue;
      }
      // If object still exists...
      if (obj.isValid.value) {
        this._invalidObjects.delete(obj.id);
      } else {
        this._invalidObjects.add(obj.id);
      }
      // update search index
      if (this.searchIndex.contain(id)) {
        this.searchIndex.remove(id);
      }
      let indexData = {
        id: id,
        target_object_id: obj.targetObject.objectId,
        target_object_text: obj.targetObject.objectText,
        source_object_id: obj.sourceObject.objectId,
        source_object_text: obj.sourceObject.objectText,
        comments: obj.comments.value,
      }
      this.searchIndex.add(indexData)
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  //  5. Search  ??//////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  /**
   * gets objects in the file that match the search term
   * @param searchTerm
   *  The term the user is searching
   * @returns
   * A list of object ids that match the search term
   */
  public getIdsMatchingSearch(searchTerm: string) {
    let resultDict = this.searchIndex.search(searchTerm);
    let results = [];
    for (const field of resultDict){
      for (const result of field.result){
        results.push(result)
      }
    }
    return results;
  }

  ///////////////////////////////////////////////////////////////////////////
  //  6. Phantom  ///////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  /**
   * Creates a phantom {@link MappingFile}.
   * @returns
   *  The phantom {@link MappingFile}.
   */
  private static createPhantomPage(): MappingFile {
    const framework = new EditableStrictFrameworkListing("NONE", "0.0.0");
    return new MappingFile({
      creationDate: new Date(),
      modifiedDate: new Date(),
      mappingObjectTemplate: new MappingObject({
        sourceObject: new StrictFrameworkObjectProperty("Phantom", framework),
        targetObject: new StrictFrameworkObjectProperty("Phantom", framework),
        author: new StringProperty("Phantom"),
        authorContact: new StringProperty("Phantom"),
        authorOrganization: new StringProperty("Phantom"),
        comments: new StringProperty("Phantom"),
      }),
    });
  }
}

type MappingFileEditorEvents = {
  autosave: (editor: MappingFileEditor) => void;
};
