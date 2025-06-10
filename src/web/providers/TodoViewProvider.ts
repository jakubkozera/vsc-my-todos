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
      }
    }); // Listen for visibility changes to refresh todos when tab becomes visible
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        // Force refresh webview when it becomes visible
        this.forceRefreshWebview();

        // If code todos haven't been initialized yet, scan them
        if (!this.isInitialized) {
          this.scanCodeTodos();
        }
      }
    });

    // Initialize webview with current todos first
    this.refreshView();

    // Then scan for code todos asynchronously and refresh again when done
    this.scanCodeTodos().then(() => {
      this.isInitialized = true;
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

    this.updateBadge();
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
  public async scanCodeTodos() {
    if (!vscode.workspace.workspaceFolders) {
      return; // No workspace open
    }

    // Remove existing code todos
    this.todos = this.todos.filter((todo) => todo.type !== "code");

    const todoRegex =
      /(\/\/|\/\*|\*|#|<!--)\s*(todo|to\s+do|to-do)\s*[:\-]?\s*(.*)/gi;
    for (const workspaceFolder of vscode.workspace.workspaceFolders) {
      // Load gitignore patterns
      const gitignorePatterns = await this.loadGitignorePatterns(
        workspaceFolder
      );

      // Find all code files in the workspace
      const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(
          workspaceFolder,
          "**/*.{ts,js,tsx,jsx,cs,java,py,cpp,c,h,hpp,php,rb,go,rs,swift,kt,vue,html,css,scss,less}"
        ),
        new vscode.RelativePattern(
          workspaceFolder,
          "{node_modules,dist,build,out,target,coverage,.git}/**"
        )
      );

      // Filter files based on gitignore patterns
      const filteredFiles = this.filterFilesByGitignore(
        files,
        workspaceFolder,
        gitignorePatterns
      );

      for (const file of filteredFiles) {
        try {
          const document = await vscode.workspace.openTextDocument(file);
          const text = document.getText();
          const lines = text.split("\n");

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const matches = [...line.matchAll(todoRegex)];
            for (const match of matches) {
              const todoText = match[3]?.trim() || "TODO";
              // Extract filename from full path
              const fileName = file.fsPath.split(/[/\\]/).pop() || "unknown";
              // Create a new code todo
              const codeTodo: Todo = {
                id: `code-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                title: todoText || "TODO",
                description: `${fileName}:${i + 1}`,
                type: "code",
                status: "todo",
                filePath: file.fsPath,
                lineNumber: i + 1,
              };

              this.todos.push(codeTodo);
            }
          }
        } catch (error) {
          console.error(`Error scanning file ${file.fsPath}:`, error);
        }
      }
    }

    this.refreshView();
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
}
