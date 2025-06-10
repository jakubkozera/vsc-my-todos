import * as vscode from "vscode";
import { Todo } from "../types/Todo";

export class TodoCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event;

  private todos: Todo[] = [];

  constructor(private todoProvider: { getTodos: () => Todo[] }) {}

  public refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }
  public updateTodos(todos: Todo[]): void {
    // Only keep workspace-scoped code todos for CodeLens
    this.todos = todos.filter(
      (todo) =>
        todo.type === "code" &&
        todo.filePath &&
        this.isWorkspaceFile(todo.filePath)
    );
    this.refresh();
  }
  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];

    // Only provide CodeLenses for files within a workspace
    if (!vscode.workspace.workspaceFolders) {
      return codeLenses;
    }

    // Check if the current file is within any workspace folder
    const documentPath = document.uri.fsPath;
    const isInWorkspace = vscode.workspace.workspaceFolders.some((folder) =>
      documentPath.startsWith(folder.uri.fsPath)
    );

    if (!isInWorkspace) {
      return codeLenses;
    }

    // Regular expression to match TODO comments
    const todoRegex =
      /(\/\/|\/\*|\*|#|<!--)\s*(todo|to\s+do|to-do)\s*[:\-]?\s*(.*)/gi;
    const text = document.getText();
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = [...line.matchAll(todoRegex)];

      for (const match of matches) {
        const startChar = match.index || 0;
        const endChar = startChar + match[0].length;
        const range = new vscode.Range(i, startChar, i, endChar);

        // Find corresponding todo in the todos list (workspace code todos only)
        const correspondingTodo = this.findCorrespondingTodo(
          document.uri.fsPath,
          i + 1
        );

        const status = correspondingTodo?.status || "todo";
        const statusIcon = this.getStatusIcon(status);
        const statusText = this.getStatusText(status);

        const command: vscode.Command = {
          title: `${statusIcon} ${statusText}`,
          command: "myTodos.showTodosView",
          arguments: [correspondingTodo?.id],
        };

        codeLenses.push(new vscode.CodeLens(range, command));
      }
    }

    return codeLenses;
  }
  private findCorrespondingTodo(
    filePath: string,
    lineNumber: number
  ): Todo | undefined {
    // Only look for code todos that are workspace-scoped
    // Code todos are generated from workspace files, so they should not be global
    return this.todos.find(
      (todo) =>
        todo.type === "code" &&
        todo.filePath === filePath &&
        todo.lineNumber === lineNumber &&
        this.isWorkspaceFile(filePath)
    );
  }

  private isWorkspaceFile(filePath: string): boolean {
    if (!vscode.workspace.workspaceFolders) {
      return false;
    }

    return vscode.workspace.workspaceFolders.some((folder) =>
      filePath.startsWith(folder.uri.fsPath)
    );
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case "todo":
        return "📝";
      case "inprogress":
        return "🔄";
      case "done":
        return "✅";
      case "blocked":
        return "🚫";
      default:
        return "📝";
    }
  }

  private getStatusText(status: string): string {
    switch (status) {
      case "todo":
        return "TODO";
      case "inprogress":
        return "IN PROGRESS";
      case "done":
        return "DONE";
      case "blocked":
        return "BLOCKED";
      default:
        return "TODO";
    }
  }
}
