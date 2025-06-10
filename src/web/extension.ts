// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TodoViewProvider } from "./providers/TodoViewProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("My Todos extension is now active!");

  const provider = new TodoViewProvider(context.extensionUri, context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TodoViewProvider.viewType,
      provider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("my-todos.refreshTodos", () => {
      provider.refreshView();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("my-todos.addTodo", () => {
      provider.addTodo();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("my-todos.refreshCodeTodos", () => {
      provider.scanCodeTodos();
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
