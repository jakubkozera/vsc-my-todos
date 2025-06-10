# CodeLens TODO Feature Demo

## Description

This VS Code extension now includes **CodeLens** functionality that shows interactive badges next to TODO comments in your code!

## Features

### 📝 **TODO Status Badges**

- **📝 TODO** - Items that need to be done
- **🔄 IN PROGRESS** - Items currently being worked on
- **✅ DONE** - Completed items
- **🚫 BLOCKED** - Items that are blocked

### 🔗 **Click to Navigate**

Click any CodeLens badge to navigate directly to the My Todos view!

## Test It Out

1. **Open the test file**: `test-codelens.ts`
2. **Look for CodeLens badges** above TODO comments
3. **Click a badge** to jump to the Todos view
4. **Change todo status** in the Todos view to see the badges update

## How It Works

1. **Automatic Detection**: The extension scans for TODO comments in various formats:

   - `// TODO: description`
   - `// to do: description`
   - `// to-do: description`
   - `/* TODO: description */`

2. **Live Updates**: CodeLens badges automatically update when you change todo status in the main todos view

3. **File Integration**: Code todos are automatically linked to their source file location

## Example Usage

```typescript
// TODO: Implement user authentication
function authenticateUser() {
  // TODO: Add password validation
  return false;
}

// This will show a "📝 TODO" CodeLens badge that you can click!
```

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

Enjoy your enhanced TODO management experience! 🎉
