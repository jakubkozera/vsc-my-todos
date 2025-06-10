export const STYLES = `
body {
	font-family: var(--vscode-font-family);
	font-size: var(--vscode-font-size);
	color: var(--vscode-foreground);
	background-color: var(--vscode-editor-background);
	margin: 0;
	padding: 0;
	height: 100vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
	padding: 16px;
	flex-shrink: 0;
	background-color: var(--vscode-editor-background);
	border-bottom: 1px solid var(--vscode-input-border);
}

.add-button {
	background-color: var(--vscode-button-background);
	color: var(--vscode-button-foreground);
	border: none;
	padding: 6px 12px;
	cursor: pointer;
	border-radius: 2px;
	font-size: 12px;
	display: flex;
	align-items: center;
	gap: 4px;
}

.add-button:hover {
	background-color: var(--vscode-button-hoverBackground);
}

.todo-list {
	list-style: none;
	padding: 16px;
	margin: 0;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
}

.todo-item {
	border: 1px solid var(--vscode-input-border);
	border-radius: 3px;
	margin-bottom: 6px;
	padding: 8px;
	padding-bottom: 0px;
	background-color: var(--vscode-input-background);
	position: relative;
	border-left: 2px solid var(--vscode-input-border);
}

.todo-item.has-empty-description {
	padding-bottom: 8px;
}

.todo-item.status-todo {
	border-left-color: #007acc; /* Blue for To do */
}

.todo-item.status-inprogress {
	border-left-color: #ff8c00; /* Orange for In progress */
}

.todo-item.status-done {
	border-left-color: #28a745; /* Green for Done */
}

.todo-item.status-blocked {
	border-left-color: #dc3545; /* Red for Blocked */
}

.todo-item.completed {
	opacity: 0.6;
}

.todo-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 2px;
}

.todo-header-actions {
	display: flex;
	align-items: center;
	gap: 2px;
}

.todo-title-row {
	display: flex;
	align-items: center;
	gap: 4px;
	flex: 1;
}

.todo-title {
	background: transparent;
	border: none;
	color: var(--vscode-foreground);
	font-size: 14px;
	font-weight: 500;
	width: 100%;
	padding: 2px 4px;
	border-radius: 2px;
}

.todo-title:focus {
	outline: 1px solid var(--vscode-focusBorder);
	background-color: var(--vscode-input-background);
}

.todo-title.empty::placeholder {
	color: var(--vscode-input-placeholderForeground);
	font-style: italic;
}

.todo-description {
	background: transparent;
	border: none;
	color: var(--vscode-foreground);
	font-size: 12px;
	width: 100%;
	margin-bottom: 4px;
	padding: 2px 4px;
	border-radius: 2px;
	resize: vertical;
	min-height: 16px;
}

.todo-description:focus {
	outline: 1px solid var(--vscode-focusBorder);
	background-color: var(--vscode-input-background);
}

.todo-description::placeholder {
	color: var(--vscode-input-placeholderForeground);
	font-style: italic;
}

.todo-description-placeholder,
.todo-actions-placeholder {
	/* Placeholders for dynamically inserted content */
}

.todo-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 4px;
}

.todo-controls {
	display: flex;
	gap: 6px;
	align-items: center;
}

.status-icon-button {
	background: none;
	border: none;
	cursor: pointer;
	padding: 1px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 2px;
	position: relative;
}

.status-icon-button:hover {
	background-color: var(--vscode-toolbar-hoverBackground);
}

.status-icon-button svg {
	width: 18px;
	height: 18px;
}

.type-icon-button {
	background: none;
	border: none;
	cursor: pointer;
	padding: 1px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 2px;
	position: relative;
}

.type-icon-button:hover {
	background-color: var(--vscode-toolbar-hoverBackground);
}

.type-icon-button svg {
	width: 18px;
	height: 18px;
	stroke: var(--vscode-foreground);
}

.type-popup {
	display: none;
	position: absolute;
	top: 100%;
	right: 0;
	background-color: var(--vscode-editor-background);
	border: 1px solid var(--vscode-input-border);
	border-radius: 4px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	z-index: 1000;
	min-width: 120px;
	margin-top: 4px;
}

.type-popup.active {
	display: block;
}

.type-option {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	cursor: pointer;
	font-size: 12px;
	border: none;
	background: none;
	width: 100%;
	text-align: left;
	color: var(--vscode-foreground);
}

.type-option:hover {
	background-color: var(--vscode-list-hoverBackground);
}

.type-option:first-child {
	border-radius: 4px 4px 0 0;
}

.type-option:last-child {
	border-radius: 0 0 4px 4px;
}

.type-option svg {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
	stroke: var(--vscode-foreground);
}

.status-popup {
	display: none;
	position: absolute;
	top: 100%;
	left: 0;
	background-color: var(--vscode-editor-background);
	border: 1px solid var(--vscode-input-border);
	border-radius: 4px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	z-index: 1000;
	min-width: 120px;
	margin-top: 4px;
}

.status-popup.active {
	display: block;
}

.status-option {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	cursor: pointer;
	font-size: 12px;
	border: none;
	background: none;
	width: 100%;
	text-align: left;
	color: var(--vscode-foreground);
}

.status-option:hover {
	background-color: var(--vscode-list-hoverBackground);
}

.status-option:first-child {
	border-radius: 4px 4px 0 0;
}

.status-option:last-child {
	border-radius: 0 0 4px 4px;
}

.status-option svg {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
}

.type-selector {
	background-color: var(--vscode-dropdown-background);
	color: var(--vscode-dropdown-foreground);
	border: 1px solid var(--vscode-dropdown-border);
	padding: 2px 6px;
	font-size: 11px;
	border-radius: 2px;
	cursor: pointer;
}

.delete-button {
	background: none;
	border: none;
	color: var(--vscode-errorForeground);
	cursor: pointer;
	padding: 2px;
	font-size: 16px;
	line-height: 1;
	opacity: 0;
	transition: opacity 0.1s ease;
}

.todo-item:hover .delete-button {
	opacity: 1;
}

.delete-button:hover {
	background-color: var(--vscode-toolbar-hoverBackground);
	border-radius: 2px;
}

.no-todos {
	text-align: center;
	color: var(--vscode-descriptionForeground);
	font-style: italic;
	margin-top: 32px;
}

.completed-text {
	text-decoration: line-through;
}

/* Filter button styles */
.filter-button {
	background: transparent;
	color: var(--vscode-foreground);
	border: 1px solid var(--vscode-input-border);
	padding: 8px;
	cursor: pointer;
	border-radius: 2px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.filter-button:hover {
	background-color: var(--vscode-list-hoverBackground);
	border-color: var(--vscode-focusBorder);
}

.filter-button svg {
	width: 16px;
	height: 16px;
	stroke: currentColor;
}

.add-button svg {
	width: 16px;
	height: 16px;
	stroke: currentColor;
}

/* Filter popup styles */
.filter-popup {
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	align-items: center;
	justify-content: center;
}

.filter-popup.active {
	display: flex;
}

.filter-popup-content {
	background-color: var(--vscode-editor-background);
	border: 1px solid var(--vscode-input-border);
	border-radius: 4px;
	width: 300px;
	max-width: 90vw;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.filter-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	border-bottom: 1px solid var(--vscode-input-border);
}

.filter-header h4 {
	margin: 0;
	font-size: 14px;
	font-weight: 600;
}

.close-button {
	background: none;
	border: none;
	color: var(--vscode-foreground);
	cursor: pointer;
	padding: 4px;
	font-size: 16px;
	line-height: 1;
	border-radius: 2px;
}

.close-button:hover {
	background-color: var(--vscode-toolbar-hoverBackground);
}

.filter-body {
	padding: 16px;
}

.filter-group {
	margin-bottom: 16px;
}

.filter-group:last-child {
	margin-bottom: 0;
}

.filter-group label {
	display: block;
	margin-bottom: 4px;
	font-size: 12px;
	font-weight: 500;
	color: var(--vscode-foreground);
}

.filter-group input,
.filter-group select {
	width: 100%;
	background-color: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border);
	padding: 6px 8px;
	font-size: 12px;
	border-radius: 2px;
	box-sizing: border-box;
}

.filter-group input:focus,
.filter-group select:focus {
	outline: 1px solid var(--vscode-focusBorder);
}

.filter-actions {
	margin-top: 16px;
	text-align: right;
}

.clear-button {
	background-color: var(--vscode-button-secondaryBackground);
	color: var(--vscode-button-secondaryForeground);
	border: none;
	padding: 6px 12px;
	cursor: pointer;
	border-radius: 2px;
	font-size: 12px;
}

.clear-button:hover {
	background-color: var(--vscode-button-secondaryHoverBackground);
}

/* Custom status dropdown styles */
.custom-status-dropdown {
	position: relative;
}

.status-dropdown-button {
	width: 100%;
	background-color: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border);
	padding: 6px 8px;
	font-size: 12px;
	border-radius: 2px;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-sizing: border-box;
}

.status-dropdown-button:focus {
	outline: 1px solid var(--vscode-focusBorder);
}

.status-dropdown-button:hover {
	background-color: var(--vscode-list-hoverBackground);
}

.status-dropdown-text {
	flex: 1;
	text-align: left;
}

.status-dropdown-menu {
	display: none;
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background-color: var(--vscode-dropdown-background);
	border: 1px solid var(--vscode-dropdown-border);
	border-radius: 2px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	z-index: 1001;
	max-height: 200px;
	overflow-y: auto;
}

.status-dropdown-menu.active {
	display: block;
}

.status-dropdown-option {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	cursor: pointer;
	font-size: 12px;
	color: var(--vscode-dropdown-foreground);
	border-radius: 2px;
	margin: 2px 4px;
	transition: background-color 0.2s ease;
}

.status-dropdown-option:hover {
	background-color: var(--vscode-list-hoverBackground);
}

.status-dropdown-option.selected {
	background-color: var(--vscode-list-activeSelectionBackground);
	color: var(--vscode-list-activeSelectionForeground);
}

.status-dropdown-option.selected:hover {
	background-color: var(--vscode-list-activeSelectionBackground);
}

.status-dropdown-actions {
	border-top: 1px solid var(--vscode-input-border);
	padding: 8px 12px;
	display: flex;
	gap: 8px;
	justify-content: space-between;
}

.status-clear-all,
.status-select-all {
	background: none;
	border: 1px solid var(--vscode-input-border);
	color: var(--vscode-foreground);
	padding: 4px 8px;
	font-size: 11px;
	border-radius: 2px;
	cursor: pointer;
	flex: 1;
}

.status-clear-all:hover,
.status-select-all:hover {
	background-color: var(--vscode-list-hoverBackground);
}

.status-dropdown-option-text {
	flex: 1;
}

/* Type dropdown styles - similar to status dropdown */
.type-dropdown {
	position: relative;
}

.type-dropdown-button {
	width: 100%;
	background-color: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	border: 1px solid var(--vscode-input-border);
	padding: 6px 8px;
	font-size: 12px;
	border-radius: 2px;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-sizing: border-box;
}

.type-dropdown-button:focus {
	outline: 1px solid var(--vscode-focusBorder);
}

.type-dropdown-button:hover {
	background-color: var(--vscode-list-hoverBackground);
}

.type-dropdown-text {
	flex: 1;
	text-align: left;
}

.type-dropdown-menu {
	display: none;
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background-color: var(--vscode-dropdown-background);
	border: 1px solid var(--vscode-dropdown-border);
	border-radius: 2px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	z-index: 1001;
	max-height: 200px;
	overflow-y: auto;
}

.type-dropdown-menu.active {
	display: block;
}

.type-dropdown-option {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	cursor: pointer;
	font-size: 12px;
	color: var(--vscode-dropdown-foreground);
	border-radius: 2px;
	margin: 2px 4px;
	transition: background-color 0.2s ease;
}

.type-dropdown-option:hover {
	background-color: var(--vscode-list-hoverBackground);
}

.type-dropdown-option.selected {
	background-color: var(--vscode-list-activeSelectionBackground);
	color: var(--vscode-list-activeSelectionForeground);
}

.type-dropdown-option.selected:hover {
	background-color: var(--vscode-list-activeSelectionBackground);
}

.type-dropdown-actions {
	border-top: 1px solid var(--vscode-input-border);
	padding: 8px 12px;
	display: flex;
	gap: 8px;
	justify-content: space-between;
}

.type-clear-all,
.type-select-all {
	background: none;
	border: 1px solid var(--vscode-input-border);
	color: var(--vscode-foreground);
	padding: 4px 8px;
	font-size: 11px;
	border-radius: 2px;
	cursor: pointer;
	flex: 1;
}

.type-clear-all:hover,
.type-select-all:hover {
	background-color: var(--vscode-list-hoverBackground);
}

.type-dropdown-option-text {
	flex: 1;
}

.type-dropdown-option svg {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
	stroke: var(--vscode-foreground);
}
`;
