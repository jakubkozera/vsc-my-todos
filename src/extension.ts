// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TodoViewProvider } from "./providers/TodoViewProvider";
import { TodoCodeLensProvider } from "./providers/TodoCodeLensProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  try {
    console.log("My Todos extension is now active! (Regular Extension Mode)");

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
        provider.refreshAll();
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("my-todos.addTodo", () => {
        provider.addTodo();
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("my-todos.openSettings", () => {
        vscode.commands.executeCommand("workbench.action.openSettings", "my-todos");
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
      try {
        codeLensProvider.updateTodos(todos);
      } catch (error) {
        console.error("Error updating CodeLens provider:", error);
      }
    });

    // Initialize CodeLens provider with current todos
    try {
      codeLensProvider.updateTodos(provider.getTodos());
    } catch (error) {
      console.error("Error initializing CodeLens provider:", error);
    }

    // Set up document change listener for real-time TODO synchronization
    let updateTimeout: NodeJS.Timeout | undefined;

    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        // Only process file documents in workspace
        if (
          event.document.uri.scheme !== "file" ||
          !vscode.workspace.workspaceFolders
        ) {
          return;
        }

        // Check if file is in workspace and supported
        const isInWorkspace = vscode.workspace.workspaceFolders.some((folder) =>
          event.document.uri.fsPath.startsWith(folder.uri.fsPath)
        );

        if (!isInWorkspace) {
          return;
        }

        // Check if it's a supported file type
        const supportedLanguages = [
          "typescript",
          "javascript",
          "typescriptreact",
          "javascriptreact",
          "python",
          "java",
          "csharp",
          "cpp",
          "c",
          "php",
          "ruby",
          "go",
          "rust",
          "swift",
          "kotlin",
          "vue",
          "html",
          "css",
          "scss",
          "less",
        ];

        if (!supportedLanguages.includes(event.document.languageId)) {
          return;
        }

        // Debounce the updates to avoid excessive processing while typing
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }

        // Check if scanning should be performed for text changes
        if (!provider.shouldScan("change")) {
          return;
        }

        updateTimeout = setTimeout(() => {
          try {
            provider.scanSingleDocument(event.document);
          } catch (error) {
            console.error("Error scanning document on change:", error);
          }
        }, 500); // 500ms delay after last change
      })
    );

    // Also listen for document save events for immediate updates
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document) => {
        // Only process file documents in workspace
        if (
          document.uri.scheme !== "file" ||
          !vscode.workspace.workspaceFolders
        ) {
          return;
        }

        // Check if file is in workspace and supported
        const isInWorkspace = vscode.workspace.workspaceFolders.some((folder) =>
          document.uri.fsPath.startsWith(folder.uri.fsPath)
        );

        if (!isInWorkspace) {
          return;
        }

        // Check if it's a supported file type
        const supportedLanguages = [
          "typescript",
          "javascript",
          "typescriptreact",
          "javascriptreact",
          "python",
          "java",
          "csharp",
          "cpp",
          "c",
          "php",
          "ruby",
          "go",
          "rust",
          "swift",
          "kotlin",
          "vue",
          "html",
          "css",
          "scss",
          "less",
        ];

        if (!supportedLanguages.includes(document.languageId)) {
          return;
        }

        // Clear any pending debounced update and scan immediately on save
        if (updateTimeout) {
          clearTimeout(updateTimeout);
          updateTimeout = undefined;
        }

        // Check if scanning should be performed for file saves
        if (!provider.shouldScan("save")) {
          return;
        }

        try {
          provider.scanSingleDocument(document);
        } catch (error) {
          console.error("Error scanning document on save:", error);
        }
      })
    );
  } catch (error) {
    console.error("Error activating My Todos extension:", error);
    vscode.window.showErrorMessage(
      `My Todos extension failed to activate: ${error}`
    );
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
