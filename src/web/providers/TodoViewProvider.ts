import * as vscode from "vscode";
import { Todo } from "../types/Todo";
import { getWebviewContent } from "../webview/WebviewContent";

export class TodoViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "todoView";
  private _view?: vscode.WebviewView;
  private todos: Todo[] = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _extensionContext: vscode.ExtensionContext
  ) {
    this.loadTodos();
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
      }
    });

    this.refreshView();
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
      this.todos[index] = updatedTodo;
      this.saveTodos();
      this.refreshView();
    }
  }

  private deleteTodo(id: string) {
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
    if (this._view) {
      this._view.webview.postMessage({
        type: "updateTodos",
        todos: this.todos,
      });
    }
    this.updateBadge();
  }
}
