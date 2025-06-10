// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TodoViewProvider } from "./providers/TodoViewProvider";
import { TodoCodeLensProvider } from "./providers/TodoCodeLensProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("My Todos extension is now active!");

  const provider = new TodoViewProvider(context.extensionUri, context);

  // Create and register CodeLens provider
  const codeLensProvider = new TodoCodeLensProvider({
    getTodos: () => provider.getTodos(),
  });

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TodoViewProvider.viewType,
      provider
    )
  );

  // Register CodeLens provider for supported file types
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      [
        { scheme: "file", language: "typescript" },
        { scheme: "file", language: "javascript" },
        { scheme: "file", language: "typescriptreact" },
        { scheme: "file", language: "javascriptreact" },
        { scheme: "file", language: "python" },
        { scheme: "file", language: "java" },
        { scheme: "file", language: "csharp" },
        { scheme: "file", language: "cpp" },
        { scheme: "file", language: "c" },
        { scheme: "file", language: "php" },
        { scheme: "file", language: "ruby" },
        { scheme: "file", language: "go" },
        { scheme: "file", language: "rust" },
        { scheme: "file", language: "swift" },
        { scheme: "file", language: "kotlin" },
        { scheme: "file", language: "vue" },
        { scheme: "file", language: "html" },
        { scheme: "file", language: "css" },
        { scheme: "file", language: "scss" },
        { scheme: "file", language: "less" },
      ],
      codeLensProvider
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

  // Command for CodeLens to show todos view
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "myTodos.showTodosView",
      (todoId?: string) => {
        // Show the todos view
        vscode.commands.executeCommand("todoView.focus");

        // If a specific todo ID is provided, we could potentially highlight it
        // For now, just focus on the todos view
      }
    )
  );

  // Set up the callback for CodeLens updates
  provider.setOnTodosChangedCallback((todos) => {
    codeLensProvider.updateTodos(todos);
  });

  // Initialize CodeLens provider with current todos
  codeLensProvider.updateTodos(provider.getTodos());
}

// This method is called when your extension is deactivated
export function deactivate() {}
