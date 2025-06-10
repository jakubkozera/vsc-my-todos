import * as vscode from "vscode";
import { Todo } from "../types/Todo";
import { getWebviewContent } from "../webview/WebviewContent";

export class TodoViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "todoView";
  private _view?: vscode.WebviewView;
  private todos: Todo[] = [];
  private onTodosChangedCallback?: (todos: Todo[]) => void;
  private isInitialized = false;
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _extensionContext: vscode.ExtensionContext
  ) {
    this.loadTodos();
    // Note: scanCodeTodos() will be called in resolveWebviewView to ensure proper timing
  }
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = getWebviewContent();
    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "addTodo":
          this.addTodo();
          break;
        case "updateTodo":
          this.updateTodo(data.todo);
          break;
        case "deleteTodo":
          this.deleteTodo(data.id);
          break;
        case "toggleComplete":
          this.toggleComplete(data.id);
          break;
        case "navigateToCode":
          this.navigateToCode(data.filePath, data.lineNumber);
          break;
        case "refreshCodeTodos":
          this.scanCodeTodos();
          break;
        case "getScanMode":
          this.sendScanModeToWebview();
          break;
        case "updateScanMode":
          this.updateScanMode(data.scanMode);
          break;
      }
    }); // Listen for visibility changes to refresh todos when tab becomes visible
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        // Force refresh webview when it becomes visible
        this.forceRefreshWebview(); // If code todos haven't been initialized yet, scan them
        if (!this.isInitialized) {
          // In web extensions, make the timeout even shorter for visibility changes
          Promise.race([
            this.scanCodeTodos(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Quick scan timeout")), 3000)
            ),
          ])
            .then(() => {
              this.isInitialized = true;
            })
            .catch((error) => {
              console.warn("Quick code scanning failed:", error);
              this.isInitialized = true;
            });
        }
      }
    }); // Initialize webview with current todos first
    this.refreshView(); // Then scan for code todos asynchronously and refresh again when done
    // Add timeout and error handling to prevent infinite loading
    Promise.race([
      this.scanCodeTodos(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Scan timeout")), 5000)
      ), // Reduced to 5 second timeout for web extensions
    ])
      .then(() => {
        console.log("Code scanning completed successfully");
        this.isInitialized = true;
      })
      .catch((error) => {
        console.warn("Code scanning failed or timed out:", error);
        this.isInitialized = true; // Mark as initialized anyway to prevent hanging
        // Show a warning to the user but don't block the extension
        vscode.window.showWarningMessage(
          "TODO scanning completed with issues. Some code TODOs may not be shown. (Web extension mode has limited file access)"
        );
      });
  }
  public addTodo() {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: "",
      description: "",
      type: "workspace",
      status: "todo",
    };
    this.todos.push(newTodo);
    this.saveTodos();
    this.refreshView();
  }
  private updateTodo(updatedTodo: Todo) {
    const index = this.todos.findIndex((todo) => todo.id === updatedTodo.id);
    if (index !== -1) {
      const existingTodo = this.todos[index];
      if (existingTodo.type === "code") {
        // Only allow status updates for code todos, not title/description changes
        existingTodo.status = updatedTodo.status;
      } else {
        this.todos[index] = updatedTodo;
      }
      this.saveTodos();
      this.refreshView();
    }
  }
  private deleteTodo(id: string) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo && todo.type === "code") {
      // Don't allow deletion of code todos - they come from the code
      return;
    }

    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.saveTodos();
    this.refreshView();
  }
  private toggleComplete(id: string) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo) {
      // Toggle between 'todo' and 'done' status
      todo.status = todo.status === "done" ? "todo" : "done";
      this.saveTodos();
      this.refreshView();
    }
  }
  private loadTodos() {
    // Load global todos
    const globalTodos = this._extensionContext.globalState.get<Todo[]>(
      "globalTodos",
      []
    );

    // Load workspace todos
    const workspaceTodos = this._extensionContext.workspaceState.get<Todo[]>(
      "workspaceTodos",
      []
    );

    // Migrate old todos from completed field to status field
    const migratedGlobalTodos = globalTodos.map((todo) =>
      this.migrateTodo(todo)
    );
    const migratedWorkspaceTodos = workspaceTodos.map((todo) =>
      this.migrateTodo(todo)
    );

    this.todos = [...migratedGlobalTodos, ...migratedWorkspaceTodos];

    // Save migrated todos back to storage
    if (migratedGlobalTodos.length > 0 || migratedWorkspaceTodos.length > 0) {
      this.saveTodos();
    }

    this.updateBadge();
  }

  private migrateTodo(todo: any): Todo {
    // If todo already has status field, return as is
    if (todo.status) {
      return todo as Todo;
    }

    // If todo has old completed field, migrate it
    if (todo.hasOwnProperty("completed")) {
      return {
        id: todo.id,
        title: todo.title || "",
        description: todo.description || "",
        type: todo.type || "workspace",
        status: todo.completed ? "done" : "todo",
      };
    }

    // Default case for any malformed todos
    return {
      id: todo.id || Date.now().toString(),
      title: todo.title || "",
      description: todo.description || "",
      type: todo.type || "workspace",
      status: "todo",
    };
  }
  private saveTodos() {
    // Only save global and workspace todos, not code todos (they are generated by scanning)
    const globalTodos = this.todos.filter((todo) => todo.type === "global");
    const workspaceTodos = this.todos.filter(
      (todo) => todo.type === "workspace"
    );

    this._extensionContext.globalState.update("globalTodos", globalTodos);
    this._extensionContext.workspaceState.update(
      "workspaceTodos",
      workspaceTodos
    );

    // Save code todo statuses separately to persist their status across refreshes
    this.saveCodeTodoStatuses();

    this.updateBadge();
  }

  private saveCodeTodoStatuses() {
    // Create a map of file:line -> status for code todos
    const codeTodoStatuses: { [key: string]: string } = {};

    this.todos
      .filter(
        (todo) => todo.type === "code" && todo.filePath && todo.lineNumber
      )
      .forEach((todo) => {
        const key = `${todo.filePath}:${todo.lineNumber}`;
        codeTodoStatuses[key] = todo.status;
      });

    this._extensionContext.workspaceState.update(
      "codeTodoStatuses",
      codeTodoStatuses
    );
  }
  private loadCodeTodoStatuses(): { [key: string]: string } {
    return this._extensionContext.workspaceState.get<{ [key: string]: string }>(
      "codeTodoStatuses",
      {}
    );
  }

  private getValidTodoStatus(
    status: string | undefined
  ): "todo" | "inprogress" | "done" | "blocked" {
    return status === "todo" ||
      status === "inprogress" ||
      status === "done" ||
      status === "blocked"
      ? status
      : "todo";
  }
  private updateBadge() {
    const incompleteTodos = this.todos.filter(
      (todo) => todo.status !== "done"
    ).length;
    vscode.commands.executeCommand("setContext", "todoCount", incompleteTodos);

    // Update the view badge
    if (this._view) {
      this._view.badge =
        incompleteTodos > 0
          ? {
              tooltip: `${incompleteTodos} incomplete todo${
                incompleteTodos === 1 ? "" : "s"
              }`,
              value: incompleteTodos,
            }
          : undefined;
    }
  }
  public refreshView() {
    // Always update badge and notify CodeLens
    this.updateBadge();

    // Notify CodeLens provider of changes
    if (this.onTodosChangedCallback) {
      this.onTodosChangedCallback(this.todos);
    }

    // Only send message to webview if it's visible
    if (this._view && this._view.visible) {
      this._view.webview.postMessage({
        type: "updateTodos",
        todos: this.todos,
      });
    }
  }

  private forceRefreshWebview() {
    // Force refresh webview regardless of visibility
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateTodos",
        todos: this.todos,
      });
    }
  }

  private async navigateToCode(filePath: string, lineNumber: number) {
    try {
      const uri = vscode.Uri.file(filePath);
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      // Navigate to the specific line
      const position = new vscode.Position(lineNumber - 1, 0); // Convert to 0-based line number
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to navigate to file: ${error}`);
    }
  }
  public async scanCodeTodos(): Promise<void> {
    try {
      console.log("Starting scanCodeTodos... (Web Extension Mode)");

      if (!vscode.workspace.workspaceFolders) {
        console.log("No workspace folders, returning early");
        return; // No workspace open
      }

      // For web extensions, we need to be much more conservative
      console.log(
        "Running in web extension mode - using simplified file scanning"
      );

      // Save current code todo statuses before removing them
      this.saveCodeTodoStatuses();

      // Remove existing code todos
      this.todos = this.todos.filter((todo) => todo.type !== "code");

      // Load saved statuses to restore them
      const savedStatuses = this.loadCodeTodoStatuses();

      const todoRegex =
        /(\/\/|\/\*|\*|#|<!--)\s*(todo|to\s+do|to-do)\s*[:\-]?\s*(.*)/gi;

      // In web extensions, limit to only a few workspace folders and use shorter timeouts
      const maxWorkspaceFolders = 1; // Only scan first workspace folder
      const workspaceFoldersToScan = vscode.workspace.workspaceFolders.slice(
        0,
        maxWorkspaceFolders
      );

      for (const workspaceFolder of workspaceFoldersToScan) {
        try {
          console.log(
            `Scanning workspace folder: ${workspaceFolder.uri.fsPath}`
          );

          // Skip gitignore loading in web extensions to avoid hanging
          console.log(
            "Skipping gitignore patterns for web extension compatibility"
          );

          // Use much shorter timeout and limited file patterns for web extensions
          const files = await Promise.race([
            vscode.workspace.findFiles(
              new vscode.RelativePattern(
                workspaceFolder,
                "**/*.{ts,js,tsx,jsx}" // Only scan common web files
              ),
              new vscode.RelativePattern(
                workspaceFolder,
                "{node_modules,dist,build,out,target,coverage,.git}/**"
              )
            ),
            new Promise<vscode.Uri[]>(
              (resolve) =>
                setTimeout(() => {
                  console.log(
                    "File search timed out - resolving with empty array"
                  );
                  resolve([]);
                }, 2000) // Very short 2 second timeout for web extensions
            ),
          ]);

          console.log(`Found ${files.length} files to scan`);

          // Much more aggressive limits for web extensions
          const maxFiles = 50; // Very limited for web extensions
          const limitedFiles = files.slice(0, maxFiles);

          if (files.length > maxFiles) {
            console.warn(
              `Limiting file scan to ${maxFiles} files (found ${files.length} total) - Web extension mode`
            );
          }

          console.log(`Processing ${limitedFiles.length} files`);

          for (
            let fileIndex = 0;
            fileIndex < limitedFiles.length;
            fileIndex++
          ) {
            const file = limitedFiles[fileIndex];
            try {
              // More frequent yields for web extensions
              if (fileIndex % 10 === 0) {
                await new Promise((resolve) => setTimeout(resolve, 5));
              }

              const document = await Promise.race([
                vscode.workspace.openTextDocument(file),
                new Promise<never>((_, reject) =>
                  setTimeout(
                    () => reject(new Error(`Timeout opening ${file.fsPath}`)),
                    1000 // Much shorter timeout for web extensions
                  )
                ),
              ]);

              const text = document.getText();

              // Much smaller file size limit for web extensions
              if (text.length > 50000) {
                // 50KB limit for web extensions
                console.warn(
                  `Skipping large file: ${file.fsPath} (${text.length} chars)`
                );
                continue;
              }

              const lines = text.split("\n");

              // Limit line processing to prevent hanging
              const maxLines = Math.min(lines.length, 1000);
              for (let i = 0; i < maxLines; i++) {
                const line = lines[i];
                const matches = [...line.matchAll(todoRegex)];
                for (const match of matches) {
                  const todoText = match[3]?.trim() || "TODO";
                  const fileName =
                    file.fsPath.split(/[/\\]/).pop() || "unknown"; // Check if we have a saved status for this todo
                  const statusKey = `${file.fsPath}:${i + 1}`;
                  const savedStatus = savedStatuses[statusKey];
                  const validStatus = this.getValidTodoStatus(savedStatus);

                  const codeTodo: Todo = {
                    id: `code-${Date.now()}-${Math.random()
                      .toString(36)
                      .substr(2, 9)}`,
                    title: todoText || "TODO",
                    description: `${fileName}:${i + 1}`,
                    type: "code",
                    status: validStatus,
                    filePath: file.fsPath,
                    lineNumber: i + 1,
                  };

                  this.todos.push(codeTodo);
                }
              }
            } catch (error) {
              console.error(`Error scanning file ${file.fsPath}:`, error);
              // Continue with other files even if one fails
            }
          }
        } catch (error) {
          console.error(
            `Error scanning workspace folder ${workspaceFolder.uri.fsPath}:`,
            error
          );
          // Continue with other workspace folders even if one fails
        }
      }

      console.log(
        `Finished scanning, found ${
          this.todos.filter((t) => t.type === "code").length
        } code todos`
      );
      this.refreshView();
    } catch (error) {
      console.error("Fatal error in scanCodeTodos:", error);
      // Don't throw the error to prevent breaking the extension
    }
  }
  private async loadGitignorePatterns(
    workspaceFolder: vscode.WorkspaceFolder
  ): Promise<string[]> {
    try {
      const gitignoreUri = vscode.Uri.joinPath(
        workspaceFolder.uri,
        ".gitignore"
      );
      const document = await vscode.workspace.openTextDocument(gitignoreUri);
      const content = document.getText();

      const patterns = content
        .split(/\r?\n/) // Handle both Windows and Unix line endings
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#")) // Remove empty lines and comments
        .map((line) => {
          // Remove trailing whitespace and normalize
          let pattern = line.replace(/\s+$/, "");
          // Remove trailing slash for directories (we'll handle this in matching)
          return pattern;
        });

      return patterns;
    } catch (error) {
      // No gitignore file or error reading it
      return [];
    }
  }
  private filterFilesByGitignore(
    files: vscode.Uri[],
    workspaceFolder: vscode.WorkspaceFolder,
    gitignorePatterns: string[]
  ): vscode.Uri[] {
    if (gitignorePatterns.length === 0) {
      return files;
    }

    return files.filter((file) => {
      const relativePath = vscode.workspace.asRelativePath(file, false);
      const normalizedPath = relativePath.replace(/\\/g, "/"); // Normalize path separators

      return !this.isIgnoredByGitignore(normalizedPath, gitignorePatterns);
    });
  }

  private isIgnoredByGitignore(filePath: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      if (this.matchesGitignorePattern(filePath, pattern)) {
        return true;
      }
    }
    return false;
  }
  private matchesGitignorePattern(filePath: string, pattern: string): boolean {
    // Handle negation patterns
    if (pattern.startsWith("!")) {
      return false; // For simplicity, we'll ignore negation patterns for now
    }

    // Convert gitignore pattern to regex
    let regexPattern = pattern
      .replace(/\./g, "\\.") // Escape dots
      .replace(/\*\*/g, "__DOUBLESTAR__") // Temporarily replace ** to handle it separately
      .replace(/\*/g, "[^/]*") // * matches anything except /
      .replace(/__DOUBLESTAR__/g, ".*") // ** matches anything including /
      .replace(/\?/g, "[^/]"); // ? matches single character except /

    // Handle directory patterns
    if (pattern.endsWith("/")) {
      regexPattern = regexPattern.slice(0, -1) + "(/.*)?$";
    } else if (pattern.includes("/")) {
      // Pattern contains path separator, match from root
      regexPattern = "^" + regexPattern + "$";
    } else {
      // Pattern doesn't contain path separator, match filename anywhere
      regexPattern = "(^|/)" + regexPattern + "(/.*)?$";
    }

    try {
      const regex = new RegExp(regexPattern);
      return regex.test(filePath);
    } catch (error) {
      // If regex is invalid, don't match
      console.warn(`Invalid gitignore pattern: ${pattern}`, error);
      return false;
    }
  }

  public getTodos(): Todo[] {
    return this.todos;
  }

  public setOnTodosChangedCallback(callback: (todos: Todo[]) => void): void {
    this.onTodosChangedCallback = callback;
  }
  public async scanSingleDocument(
    document: vscode.TextDocument
  ): Promise<void> {
    try {
      if (!vscode.workspace.workspaceFolders) {
        return; // No workspace open
      }

      // Check if the document is within any workspace folder
      const isInWorkspace = vscode.workspace.workspaceFolders.some((folder) =>
        document.uri.fsPath.startsWith(folder.uri.fsPath)
      );

      if (!isInWorkspace) {
        return;
      }

      const filePath = document.uri.fsPath;

      // Remove existing code todos for this specific file
      this.todos = this.todos.filter(
        (todo) => todo.type !== "code" || todo.filePath !== filePath
      );

      // Load saved statuses to restore them
      const savedStatuses = this.loadCodeTodoStatuses();

      const todoRegex =
        /(\/\/|\/\*|\*|#|<!--)\s*(todo|to\s+do|to-do)\s*[:\-]?\s*(.*)/gi;

      const text = document.getText();

      // Skip very large files
      if (text.length > 200000) {
        console.warn(`Skipping large file: ${filePath} (${text.length} chars)`);
        return;
      }

      const lines = text.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matches = [...line.matchAll(todoRegex)];

        for (const match of matches) {
          const todoText = match[3]?.trim() || "TODO";
          // Extract filename from full path
          const fileName = filePath.split(/[/\\]/).pop() || "unknown";

          // Check if a todo with the same file and line already exists
          const existingTodo = this.todos.find(
            (todo) =>
              todo.type === "code" &&
              todo.filePath === filePath &&
              todo.lineNumber === i + 1
          );
          if (!existingTodo) {
            // Check if we have a saved status for this todo
            const statusKey = `${filePath}:${i + 1}`;
            const savedStatus = savedStatuses[statusKey];
            const validStatus = this.getValidTodoStatus(savedStatus);

            // Create a new code todo
            const codeTodo: Todo = {
              id: `code-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              title: todoText || "TODO",
              description: `${fileName}:${i + 1}`,
              type: "code",
              status: validStatus,
              filePath: filePath,
              lineNumber: i + 1,
            };

            this.todos.push(codeTodo);
          } else {
            // Update existing todo title if it changed, but preserve status
            if (existingTodo.title !== todoText) {
              existingTodo.title = todoText;
            }
            // Update description with current line number (in case line moved)
            existingTodo.description = `${fileName}:${i + 1}`;
            existingTodo.lineNumber = i + 1;
          }
        }
      }
      this.refreshView();
    } catch (error) {
      console.error("Error in scanSingleDocument:", error);
      // Don't throw the error to prevent breaking the extension
    }
  }

  // Settings management methods
  private getScanMode(): string {
    const config = vscode.workspace.getConfiguration("my-todos");
    return config.get("scanMode", "activeScan");
  }

  private async updateScanMode(scanMode: string): Promise<void> {
    const config = vscode.workspace.getConfiguration("my-todos");
    await config.update(
      "scanMode",
      scanMode,
      vscode.ConfigurationTarget.Global
    );
    // Send confirmation back to webview
    this.sendScanModeToWebview();
  }

  private sendScanModeToWebview(): void {
    if (this._view) {
      this._view.webview.postMessage({
        type: "setScanMode",
        scanMode: this.getScanMode(),
      });
    }
  }

  // Method to check if scanning should be performed based on current settings
  public shouldScan(trigger: "change" | "save"): boolean {
    const scanMode = this.getScanMode();

    switch (scanMode) {
      case "off":
        return false;
      case "onSave":
        return trigger === "save";
      case "activeScan":
        return true;
      default:
        return true; // Default to active scan for backward compatibility
    }
  }
}
