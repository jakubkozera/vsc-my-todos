# My Todos Extension

A powerful VS Code extension for managing TODO comments with real-time synchronization and CodeLens integration.

## Features

![My Todos demo](https://raw.githubusercontent.com/jakubkozera/vsc-my-todos/master/demo.gif)

### 📝 Real-time TODO Synchronization

- **Live Updates**: TODO comments are automatically detected and synced to the todos view as you type
- **Immediate Feedback**: No need to save files - changes appear instantly (with 500ms debounce)
- **File Save Integration**: Changes are also synced immediately when you save files

### 🔍 CodeLens Integration

- **Interactive Badges**: See TODO status badges directly above your comments in the code
- **Click to Navigate**: Click CodeLens badges to jump to the todos view
- **Status Indicators**: Visual indicators show current status (📝 TODO, 🔄 IN PROGRESS, ✅ DONE, 🚫 BLOCKED)

### 📊 Smart TODO Management

- **Multiple TODO Types**:
  - **Global**: Available across all workspaces
  - **Workspace**: Specific to current workspace
  - **Code**: Automatically detected from comments
- **Status Tracking**: Track progress with todo, in-progress, done, and blocked states
- **Filtering & Sorting**: Advanced filtering by text, status, and type with multiple sort options

### 🎯 Supported Comment Formats

The extension automatically detects TODO comments in various formats:

```typescript
// TODO: Standard format
// to do: With spaces
// to-do: With dashes
/* TODO: Block comments */
# TODO: Hash comments (Python, etc.)
<!-- TODO: HTML comments -->
```

### 🚀 Getting Started

1. Install the extension
2. Open the "Todos" view in the sidebar
3. Start typing TODO comments in your code files
4. Watch them appear automatically in the todos view!

## Supported File Types

- TypeScript/JavaScript (`.ts`, `.js`, `.tsx`, `.jsx`)
- Python (`.py`)
- Java (`.java`)
- C# (`.cs`)
- C/C++ (`.c`, `.cpp`, `.h`, `.hpp`)
- PHP (`.php`)
- Ruby (`.rb`)
- Go (`.go`)
- Rust (`.rs`)
- Swift (`.swift`)
- Kotlin (`.kt`)
- Vue (`.vue`)
- HTML (`.html`)
- CSS/SCSS/Less (`.css`, `.scss`, `.less`)

## How It Works

1. **Type a TODO comment** in any supported file (e.g., `// TODO: Fix this bug`)
2. **Watch it appear** in the todos view automatically (no save required!)
3. **Click the CodeLens badge** above your comment to navigate to the todos view
4. **Update status** in the todos view (todo → in-progress → done)
5. **See status changes** reflected in the CodeLens badges

## Commands

- `My Todos: Add Todo` - Add a new manual todo
- `My Todos: Refresh Todos` - Refresh the todos view
- `My Todos: Refresh Code TODOs` - Manually scan for code TODOs

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

This extension contributes the following settings:

### `my-todos.scanMode`

Controls when the extension scans for TODO comments in your code:

- `"activeScan"` (default): Real-time scanning - detects TODOs as you type
- `"onSave"`: Scan only when files are saved
- `"off"`: Manual refresh only - no automatic TODO detection

### `my-todos.excludePatterns`

Additional folder patterns to exclude from TODO scanning (comma-separated).

**Default exclusions** (always applied):

- `node_modules`, `dist`, `build`, `out`, `target`
- `coverage`, `.git`
- `__pycache__`

**Examples:**

- `"temp,logs"` - excludes temp and logs folders
- `"vendor,third-party"` - excludes vendor and third-party folders
- `"test-folder,demo"` - excludes test-folder and demo folders

**Note:** Currently supports folder name matching only. File extension patterns (like `*.js`) are not supported.

**Access Settings:**

- Go to File → Preferences → Settings and search for "My Todos"
- Or click the settings button (⚙️) in the My Todos view

## Known Issues

- Real-time synchronization may have a slight delay (500ms) to avoid excessive processing while typing
- Gitignore patterns with negation (!) are not fully supported
- Very large files with many TODO comments may impact performance

## Release Notes

### 1.2.0

**🎉 Major Feature: Real-time TODO Synchronization**

- Added live TODO comment detection as you type (500ms debounce)
- Immediate synchronization on file save
- Enhanced CodeLens integration with real-time updates
- Preserved TODO status when comments are modified
- Improved performance for single document scanning

### 1.1.0

- Added CodeLens integration for interactive TODO badges
- Multiple status support (todo, in-progress, done, blocked)
- Advanced filtering and sorting capabilities
- Support for multiple TODO comment formats

### 1.0.0

- Initial release with basic TODO management
- Global and workspace TODO support
- Basic code scanning functionality

---

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
