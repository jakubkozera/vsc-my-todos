export const SCRIPT = `
const vscode = acquireVsCodeApi();
let todos = [];
let filteredTodos = [];
let filters = {
	text: '',
	statuses: [], // Changed from status to statuses array
	types: [] // Changed from type to types array for multi-select
};
let sortSettings = {
	sortBy: 'created', // Default sort by created date
	sortOrder: 'desc' // Default order descending
};

window.addEventListener('message', event => {
	const message = event.data;
	switch (message.type) {
		case 'updateTodos':
			todos = message.todos;
			applyFilters();
			break;
	}
});

function addTodo() {
	vscode.postMessage({
		type: 'addTodo'
	});
}

function updateTodo(id) {
	const todo = todos.find(t => t.id === id);
	if (todo) {
		vscode.postMessage({
			type: 'updateTodo',
			todo: todo
		});
	}
}

function deleteTodo(id) {
	vscode.postMessage({
		type: 'deleteTodo',
		id: id
	});
}

function toggleComplete(id) {
	vscode.postMessage({
		type: 'toggleComplete',
		id: id
	});
}

function getTypeIcon(type) {
	if (type === 'workspace') {
		return \`<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="20" height="20">
			<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"></path>
		</svg>\`;
	} else if (type === 'code') {
		return \`<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="20" height="20">
			<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"></path>
		</svg>\`;
	} else {
		return \`<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="20" height="20">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"></path>
		</svg>\`;
	}
}

function getTypeLabel(type) {
	switch (type) {
		case 'workspace': return 'Workspace';
		case 'code': return 'Code';
		case 'global': return 'Global';
		default: return 'Global';
	}
}

function toggleTypePopup(todoId, event) {
	event.stopPropagation();
	
	// Close any other open popups
	document.querySelectorAll('.type-popup.active').forEach(popup => {
		if (popup.id !== \`typePopup-\${todoId}\`) {
			popup.classList.remove('active');
		}
	});
	
	const popup = document.getElementById(\`typePopup-\${todoId}\`);
	popup.classList.toggle('active');
}

function selectType(todoId, newType, event) {
	event.stopPropagation();
	onTypeChange(todoId, newType);
	
	// Close the popup
	const popup = document.getElementById(\`typePopup-\${todoId}\`);
	popup.classList.remove('active');
}

function getStatusLabel(status) {
	switch (status) {
		case 'todo': return 'To do';
		case 'inprogress': return 'In progress';
		case 'done': return 'Done';
		case 'blocked': return 'Blocked';
		default: return 'To do';
	}
}

function getStatusColor(status) {
	switch (status) {
		case 'todo': return '#007acc';
		case 'inprogress': return '#ff8c00';
		case 'done': return '#28a745';
		case 'blocked': return '#dc3545';
		default: return '#007acc';
	}
}

function toggleStatusPopup(todoId, event) {
	event.stopPropagation();
	
	// Close any other open popups
	document.querySelectorAll('.status-popup.active').forEach(popup => {
		if (popup.id !== \`statusPopup-\${todoId}\`) {
			popup.classList.remove('active');
		}
	});
	
	const popup = document.getElementById(\`statusPopup-\${todoId}\`);
	popup.classList.toggle('active');
}

function selectStatus(todoId, newStatus, event) {
	event.stopPropagation();
	onStatusChange(todoId, newStatus);
	
	// Close the popup
	const popup = document.getElementById(\`statusPopup-\${todoId}\`);
	popup.classList.remove('active');
}

function onStatusChange(id, value) {
	const todo = todos.find(t => t.id === id);
	if (todo) {
		todo.status = value;
		updateTodo(id);
	}
}

function onTitleChange(id, value) {
	const todo = todos.find(t => t.id === id);
	if (todo && todo.type !== 'code') { // Don't allow editing code todo titles
		todo.title = value;
		updateTodo(id);
	}
}

function onDescriptionChange(id, value) {
	const todo = todos.find(t => t.id === id);
	if (todo && todo.type !== 'code') { // Don't allow editing code todo descriptions
		const wasEmpty = !todo.description;
		todo.description = value;
		updateTodo(id);
		
		// If description changed from empty to non-empty, re-render to update the structure
		if (wasEmpty && value.trim()) {
			renderTodos();
		}
	}
}

function onTypeChange(id, value) {
	const todo = todos.find(t => t.id === id);
	if (todo && todo.type !== 'code') { // Don't allow changing type of code todos
		todo.type = value;
		updateTodo(id);
	}
}

function toggleFilterPopup() {
	const popup = document.getElementById('filterPopup');
	popup.classList.toggle('active');
}

function toggleSortPopup() {
	const popup = document.getElementById('sortPopup');
	popup.classList.toggle('active');
}

function updateSort() {
	// Apply sorting - this function is now called from dropdown selections
	applyFilters();
}

function toggleSortByDropdown() {
	const menu = document.getElementById('sortByDropdownMenu');
	menu.classList.toggle('active');
}

function toggleSortOrderDropdown() {
	const menu = document.getElementById('sortOrderDropdownMenu');
	menu.classList.toggle('active');
}

function selectSortBy(value) {
	// Update the sort setting
	sortSettings.sortBy = value;
	
	// Update visual selection
	const options = document.querySelectorAll('#sortByDropdownMenu .sort-by-dropdown-option');
	options.forEach(option => {
		if (option.getAttribute('data-value') === value) {
			option.classList.add('selected');
		} else {
			option.classList.remove('selected');
		}
	});
	
	// Update button text
	updateSortByButtonText();
	
	// Close dropdown
	document.getElementById('sortByDropdownMenu').classList.remove('active');
	
	// Apply sorting
	updateSort();
}

function selectSortOrder(value) {
	// Update the sort setting
	sortSettings.sortOrder = value;
	
	// Update visual selection
	const options = document.querySelectorAll('#sortOrderDropdownMenu .sort-order-dropdown-option');
	options.forEach(option => {
		if (option.getAttribute('data-value') === value) {
			option.classList.add('selected');
		} else {
			option.classList.remove('selected');
		}
	});
	
	// Update button text
	updateSortOrderButtonText();
	
	// Close dropdown
	document.getElementById('sortOrderDropdownMenu').classList.remove('active');
	
	// Apply sorting
	updateSort();
}

function updateSortByButtonText() {
	const button = document.getElementById('sortByDropdownButton');
	const textSpan = button.querySelector('.sort-by-dropdown-text');
	
	switch (sortSettings.sortBy) {
		case 'type':
			textSpan.innerHTML = \`
				<div style="display: flex; align-items: center; gap: 8px;">
					<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"></path>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z"></path>
					</svg>
					<span>Type</span>
				</div>
			\`;
			break;
		case 'status':
			textSpan.innerHTML = \`
				<div style="display: flex; align-items: center; gap: 8px;">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="12" cy="12" r="8" fill="#007acc" />
					</svg>
					<span>Status</span>
				</div>
			\`;
			break;
		case 'created':
			textSpan.innerHTML = \`
				<div style="display: flex; align-items: center; gap: 8px;">
					<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"></path>
					</svg>
					<span>Created Date</span>
				</div>
			\`;
			break;
	}
}

function updateSortOrderButtonText() {
	const button = document.getElementById('sortOrderDropdownButton');
	const textSpan = button.querySelector('.sort-order-dropdown-text');
	
	switch (sortSettings.sortOrder) {
		case 'desc':
			textSpan.innerHTML = \`
				<div style="display: flex; align-items: center; gap: 8px;">
					<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m6.75 4.5L21 14.25m0 0L18 11.25m3 3H7.5"></path>
					</svg>
					<span>Descending</span>
				</div>
			\`;
			break;
		case 'asc':
			textSpan.innerHTML = \`
				<div style="display: flex; align-items: center; gap: 8px;">
					<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m0 0-3-3m3 3-3 3M21 14.25H10.5"></path>
					</svg>
					<span>Ascending</span>
				</div>
			\`;
			break;
	}
}

function resetSort() {
	// Reset to default values
	sortSettings.sortBy = 'created';
	sortSettings.sortOrder = 'desc';
	
	// Update sort by dropdown selection
	const sortByOptions = document.querySelectorAll('#sortByDropdownMenu .sort-by-dropdown-option');
	sortByOptions.forEach(option => {
		if (option.getAttribute('data-value') === 'created') {
			option.classList.add('selected');
		} else {
			option.classList.remove('selected');
		}
	});
	
	// Update sort order dropdown selection
	const sortOrderOptions = document.querySelectorAll('#sortOrderDropdownMenu .sort-order-dropdown-option');
	sortOrderOptions.forEach(option => {
		if (option.getAttribute('data-value') === 'desc') {
			option.classList.add('selected');
		} else {
			option.classList.remove('selected');
		}
	});
	
	// Update button texts
	updateSortByButtonText();
	updateSortOrderButtonText();
	
	// Apply sorting
	updateSort();
}

function sortTodos(todosToSort) {
	const sorted = [...todosToSort].sort((a, b) => {
		let valueA, valueB;
		
		switch (sortSettings.sortBy) {
			case 'type':
				valueA = a.type;
				valueB = b.type;
				break;
			case 'status':
				// Define status order for sorting
				const statusOrder = { 'todo': 0, 'inprogress': 1, 'blocked': 2, 'done': 3 };
				valueA = statusOrder[a.status] ?? 0;
				valueB = statusOrder[b.status] ?? 0;
				break;
			case 'created':
				// Using todo.id as created date (timestamp)
				valueA = parseInt(a.id);
				valueB = parseInt(b.id);
				break;
			default:
				return 0;
		}
		
		// Compare values
		let comparison = 0;
		if (sortSettings.sortBy === 'created') {
			// For timestamps, direct numerical comparison
			comparison = valueA - valueB;
		} else if (typeof valueA === 'string' && typeof valueB === 'string') {
			// For strings, use localeCompare
			comparison = valueA.localeCompare(valueB);
		} else {
			// For numbers
			comparison = valueA - valueB;
		}
		
		// Apply sort order
		return sortSettings.sortOrder === 'desc' ? -comparison : comparison;
	});
	
	return sorted;
}

function applyFilters() {
	const textFilter = document.getElementById('filterText').value.toLowerCase();
	
	filters.text = textFilter;
	
	filteredTodos = todos.filter(todo => {
		// Text filter for title and description
		const textMatch = !textFilter || 
			(todo.title && todo.title.toLowerCase().includes(textFilter)) ||
			(todo.description && todo.description.toLowerCase().includes(textFilter));
		
		// Status filter - check if todo status is in selected statuses array
		const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(todo.status);
		
		// Type filter - check if todo type is in selected types array
		const typeMatch = filters.types.length === 0 || filters.types.includes(todo.type);
		
		return textMatch && statusMatch && typeMatch;
	});
	
	// Apply sorting to filtered todos
	filteredTodos = sortTodos(filteredTodos);
	
	renderTodos();
}

function toggleStatusDropdown() {
	const menu = document.getElementById('statusDropdownMenu');
	menu.classList.toggle('active');
}

function toggleStatusSelection(statusValue) {
	// Toggle the status in the filters array
	const index = filters.statuses.indexOf(statusValue);
	if (index > -1) {
		filters.statuses.splice(index, 1);
	} else {
		filters.statuses.push(statusValue);
	}
	
	// Update visual selection
	updateStatusSelectionVisual();
	
	// Update the button text
	updateStatusButtonText();
	
	// Apply filters
	applyFilters();
}

function updateStatusSelectionVisual() {
	// Update the visual state of all status options
	const options = document.querySelectorAll('#statusDropdownMenu .status-dropdown-option[data-value]');
	options.forEach(option => {
		const value = option.getAttribute('data-value');
		if (filters.statuses.includes(value)) {
			option.classList.add('selected');
		} else {
			option.classList.remove('selected');
		}
	});
}

function updateStatusFilter() {
	// This function is kept for compatibility but functionality moved to toggleStatusSelection
	updateStatusButtonText();
	applyFilters();
}

function updateStatusButtonText() {
	const button = document.getElementById('statusDropdownButton');
	const textSpan = button.querySelector('.status-dropdown-text');
	
	if (filters.statuses.length === 0) {
		textSpan.textContent = 'All statuses';
	} else if (filters.statuses.length === 1) {
		// Show single status with icon
		const status = filters.statuses[0];
		const statusText = getStatusLabel(status);
		textSpan.innerHTML = \`
			<div style="display: flex; align-items: center; gap: 8px;">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="8" fill="\${getStatusColor(status)}" />
				</svg>
				<span>\${statusText}</span>
			</div>
		\`;
	} else {
		// Show count of selected statuses
		textSpan.innerHTML = \`
			<div style="display: flex; align-items: center; gap: 8px;">
				<span>\${filters.statuses.length} statuses selected</span>
			</div>
		\`;
	}
}

function clearAllStatuses() {
	// Clear all selected statuses
	filters.statuses = [];
	
	// Update visual selection
	updateStatusSelectionVisual();
	
	// Update filter
	updateStatusButtonText();
	applyFilters();
}

function selectAllStatuses() {
	// Select all status values
	filters.statuses = ['todo', 'inprogress', 'done', 'blocked'];
	
	// Update visual selection
	updateStatusSelectionVisual();
	
	// Update filter
	updateStatusButtonText();
	applyFilters();
}

function toggleTypeDropdown() {
	const menu = document.getElementById('typeDropdownMenu');
	menu.classList.toggle('active');
}

function toggleTypeSelection(typeValue) {
	// Toggle the type in the filters array
	const index = filters.types.indexOf(typeValue);
	if (index > -1) {
		filters.types.splice(index, 1);
	} else {
		filters.types.push(typeValue);
	}
	
	// Update visual selection
	updateTypeSelectionVisual();
	
	// Update the button text
	updateTypeButtonText();
	
	// Apply filters
	applyFilters();
}

function updateTypeSelectionVisual() {
	// Update the visual state of all type options
	const options = document.querySelectorAll('#typeDropdownMenu .type-dropdown-option[data-value]');
	options.forEach(option => {
		const value = option.getAttribute('data-value');
		if (filters.types.includes(value)) {
			option.classList.add('selected');
		} else {
			option.classList.remove('selected');
		}
	});
}

function updateTypeFilter() {
	// This function is kept for compatibility but functionality moved to toggleTypeSelection
	updateTypeButtonText();
	applyFilters();
}

function updateTypeButtonText() {
	const button = document.getElementById('typeDropdownButton');
	const textSpan = button.querySelector('.type-dropdown-text');
	
	if (filters.types.length === 0) {
		textSpan.textContent = 'All types';
	} else if (filters.types.length === 1) {
		// Show single type with icon
		const type = filters.types[0];
		const typeText = getTypeLabel(type);
		textSpan.innerHTML = \`
			<div style="display: flex; align-items: center; gap: 8px;">
				\${getTypeIcon(type)}
				<span>\${typeText}</span>
			</div>
		\`;
	} else {
		// Show count of selected types
		textSpan.innerHTML = \`
			<div style="display: flex; align-items: center; gap: 8px;">
				<span>\${filters.types.length} types selected</span>
			</div>
		\`;
	}
}

function clearAllTypes() {
	// Clear all selected types
	filters.types = [];
	
	// Update visual selection
	updateTypeSelectionVisual();
	
	// Update filter
	updateTypeButtonText();
	applyFilters();
}

function selectAllTypes() {
	// Select all type values
	filters.types = ['workspace', 'global', 'code'];
	
	// Update visual selection
	updateTypeSelectionVisual();
	
	// Update filter
	updateTypeButtonText();
	applyFilters();
}

function clearFilters() {
	document.getElementById('filterText').value = '';
	
	// Clear all status and type selections
	filters.statuses = [];
	filters.types = [];
	
	// Reset filters
	filters = { text: '', statuses: [], types: [] };
	
	// Update visual selection
	updateStatusSelectionVisual();
	updateTypeSelectionVisual();
	
	// Update button texts
	updateStatusButtonText();
	updateTypeButtonText();
	
	filteredTodos = todos;
	renderTodos();
}

function renderTodos() {
	const todoList = document.getElementById('todoList');
	let todosToRender = filteredTodos.length > 0 || hasActiveFilters() ? filteredTodos : todos;
	
	// Apply sorting if no filters are active
	if (!hasActiveFilters()) {
		todosToRender = sortTodos(todos);
	}
	
	if (todosToRender.length === 0) {
		if (hasActiveFilters()) {
			todoList.innerHTML = '<li class="no-todos">No todos match the current filters.</li>';
		} else {
			todoList.innerHTML = '<li class="no-todos">No todos yet. Click "Add" to create your first todo!</li>';
		}
		return;
	}	todoList.innerHTML = todosToRender.map(todo => \`
		<li class="todo-item status-\${todo.status} \${todo.status === 'done' ? 'completed' : ''} \${!todo.description ? 'has-empty-description' : ''}" 
			data-todo-id="\${todo.id}">
			<div class="todo-header">				<div class="todo-title-row">
					<div style="position: relative;">
						<button class="status-icon-button" onclick="toggleStatusPopup('\${todo.id}', event)" title="Change status">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="12" cy="12" r="8" fill="\${getStatusColor(todo.status)}" />
							</svg>
						</button>
						<div class="status-popup" id="statusPopup-\${todo.id}">
							<button class="status-option" onclick="selectStatus('\${todo.id}', 'todo', event)">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="8" fill="\${getStatusColor('todo')}" />
								</svg>
								To do
							</button>
							<button class="status-option" onclick="selectStatus('\${todo.id}', 'inprogress', event)">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="8" fill="\${getStatusColor('inprogress')}" />
								</svg>
								In progress
							</button>
							<button class="status-option" onclick="selectStatus('\${todo.id}', 'done', event)">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="8" fill="\${getStatusColor('done')}" />
								</svg>
								Done
							</button>
							<button class="status-option" onclick="selectStatus('\${todo.id}', 'blocked', event)">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="8" fill="\${getStatusColor('blocked')}" />
								</svg>
								Blocked
							</button>
						</div>
					</div>					<input 
						type="text" 
						class="todo-title \${!todo.title ? 'empty' : ''}" 
						value="\${todo.title}" 
						placeholder="Title"
						onchange="onTitleChange('\${todo.id}', this.value)"
						onfocus="handleTitleFocus('\${todo.id}')"
						onblur="handleTitleBlur('\${todo.id}')"
						\${todo.status === 'done' || todo.type === 'code' ? 'readonly' : ''}
					/>					\${todo.type !== 'code' ? \`<button class="delete-button" onclick="deleteTodo('\${todo.id}')" title="Delete todo">
						×
					</button>\` : ''}<div style="position: relative;">
						<button class="type-icon-button" onclick="\${todo.type === 'code' ? \`navigateToCodeTodo('\${todo.id}')\` : \`toggleTypePopup('\${todo.id}', event)\`}" title="\${todo.type === 'code' ? 'Navigate to code' : 'Change type'}">
							\${getTypeIcon(todo.type)}
						</button>
						\${todo.type !== 'code' ? \`<div class="type-popup" id="typePopup-\${todo.id}">
							<button class="type-option" onclick="selectType('\${todo.id}', 'workspace', event)">
								<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"></path>
								</svg>
								Workspace
							</button>
							<button class="type-option" onclick="selectType('\${todo.id}', 'global', event)">
								<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"></path>
								</svg>
								Global
							</button>
						</div>\` : ''}
					</div>
				</div>			</div>			\${todo.description ? \`<textarea 
				class="todo-description" 
				placeholder="Description"
				onchange="onDescriptionChange('\${todo.id}', this.value)"
				\${todo.status === 'done' || todo.type === 'code' ? 'readonly' : ''}
			>\${todo.description}</textarea>\` : ''}
			<div class="todo-description-placeholder" id="description-placeholder-\${todo.id}"></div>
		</li>
	\`).join('');
}

function hasActiveFilters() {
	return filters.text !== '' || filters.statuses.length > 0 || filters.types.length > 0;
}

function handleTitleFocus(todoId) {
	const todo = todos.find(t => t.id === todoId);
	if (!todo || todo.description || todo.type === 'code') return; // Don't add description for code todos
	
	const placeholder = document.getElementById(\`description-placeholder-\${todoId}\`);
	
	if (placeholder && !placeholder.querySelector('.todo-description')) {
		// Create and insert description textarea
		const textarea = document.createElement('textarea');
		textarea.className = 'todo-description';
		textarea.placeholder = 'Description';
		textarea.value = todo.description || '';
		textarea.setAttribute('onchange', \`onDescriptionChange('\${todoId}', this.value)\`);
		if (todo.status === 'done') {
			textarea.setAttribute('readonly', '');
		}
		placeholder.appendChild(textarea);
	}
}

function handleTitleBlur(todoId) {
	const todo = todos.find(t => t.id === todoId);
	if (!todo || todo.description || todo.type === 'code') return; // Don't handle code todos
	
	const placeholder = document.getElementById(\`description-placeholder-\${todoId}\`);
	
	// Check if the textarea has content before removing
	const textarea = placeholder?.querySelector('.todo-description');
	if (textarea && !textarea.value.trim()) {
		// Remove description textarea after a short delay to allow for focus changes
		setTimeout(() => {
			// Check again if textarea is still empty and not focused
			if (textarea && !textarea.value.trim() && document.activeElement !== textarea) {
				if (placeholder) {
					placeholder.innerHTML = '';
				}
			}
		}, 100);
	}
}

// Close popup when clicking outside
document.addEventListener('click', function(event) {
	const popup = document.getElementById('filterPopup');
	const filterButton = document.querySelector('.filter-button');
	
	if (popup && popup.classList.contains('active') && 
		!popup.querySelector('.filter-popup-content').contains(event.target) &&
		!filterButton.contains(event.target)) {
		popup.classList.remove('active');
	}
	
	// Close sort popup when clicking outside
	const sortPopup = document.getElementById('sortPopup');
	const sortButton = document.querySelector('.sort-button');
	
	if (sortPopup && sortPopup.classList.contains('active') && 
		!sortPopup.querySelector('.sort-popup-content').contains(event.target) &&
		!sortButton.contains(event.target)) {
		sortPopup.classList.remove('active');
	}
		// Close status popups when clicking outside
	document.querySelectorAll('.status-popup.active').forEach(statusPopup => {
		const statusButton = statusPopup.previousElementSibling;
		if (!statusPopup.contains(event.target) && !statusButton.contains(event.target)) {
			statusPopup.classList.remove('active');
		}
	});
	
	// Close type popups when clicking outside
	document.querySelectorAll('.type-popup.active').forEach(typePopup => {
		const typeButton = typePopup.previousElementSibling;
		if (!typePopup.contains(event.target) && !typeButton.contains(event.target)) {
			typePopup.classList.remove('active');
		}
	});
	// Close status dropdown when clicking outside (but not when clicking on checkboxes or labels inside)
	const statusDropdown = document.getElementById('statusDropdownMenu');
	const statusDropdownButton = document.getElementById('statusDropdownButton');
	if (statusDropdown && statusDropdown.classList.contains('active') &&
		!statusDropdown.contains(event.target) && 
		!statusDropdownButton.contains(event.target)) {
		statusDropdown.classList.remove('active');
	}
		// Close type dropdown when clicking outside (but not when clicking on options inside)
	const typeDropdown = document.getElementById('typeDropdownMenu');
	const typeDropdownButton = document.getElementById('typeDropdownButton');
	if (typeDropdown && typeDropdown.classList.contains('active') &&
		!typeDropdown.contains(event.target) && 
		!typeDropdownButton.contains(event.target)) {
		typeDropdown.classList.remove('active');
	}
	
	// Close sort by dropdown when clicking outside
	const sortByDropdown = document.getElementById('sortByDropdownMenu');
	const sortByDropdownButton = document.getElementById('sortByDropdownButton');
	if (sortByDropdown && sortByDropdown.classList.contains('active') &&
		!sortByDropdown.contains(event.target) && 
		!sortByDropdownButton.contains(event.target)) {
		sortByDropdown.classList.remove('active');
	}
	
	// Close sort order dropdown when clicking outside
	const sortOrderDropdown = document.getElementById('sortOrderDropdownMenu');
	const sortOrderDropdownButton = document.getElementById('sortOrderDropdownButton');
	if (sortOrderDropdown && sortOrderDropdown.classList.contains('active') &&
		!sortOrderDropdown.contains(event.target) && 
		!sortOrderDropdownButton.contains(event.target)) {
		sortOrderDropdown.classList.remove('active');
	}
});

// Initial render
applyFilters();

// Initialize sort dropdown texts
updateSortByButtonText();
updateSortOrderButtonText();

function navigateToCodeTodo(todoId) {
	const todo = todos.find(t => t.id === todoId);
	if (todo && todo.type === 'code' && todo.filePath && todo.lineNumber) {
		vscode.postMessage({
			type: 'navigateToCode',
			filePath: todo.filePath,
			lineNumber: todo.lineNumber
		});
	}
}
`;
