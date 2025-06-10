export const SCRIPT = `
const vscode = acquireVsCodeApi();
let todos = [];
let filteredTodos = [];
let filters = {
	text: '',
	statuses: [], // Changed from status to statuses array
	type: ''
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

function getStatusColor(status) {
	switch (status) {
		case 'todo': return '#007acc';
		case 'inprogress': return '#ff8c00';
		case 'done': return '#28a745';
		case 'blocked': return '#dc3545';
		default: return '#007acc';
	}
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
	if (todo) {
		todo.title = value;
		updateTodo(id);
	}
}

function onDescriptionChange(id, value) {
	const todo = todos.find(t => t.id === id);
	if (todo) {
		todo.description = value;
		updateTodo(id);
	}
}

function onTypeChange(id, value) {
	const todo = todos.find(t => t.id === id);
	if (todo) {
		todo.type = value;
		updateTodo(id);
	}
}

function toggleFilterPopup() {
	const popup = document.getElementById('filterPopup');
	popup.classList.toggle('active');
}

function applyFilters() {
	const textFilter = document.getElementById('filterText').value.toLowerCase();
	const typeFilter = document.getElementById('filterType').value;
	
	filters.text = textFilter;
	filters.type = typeFilter;
	
	filteredTodos = todos.filter(todo => {
		// Text filter for title and description
		const textMatch = !textFilter || 
			(todo.title && todo.title.toLowerCase().includes(textFilter)) ||
			(todo.description && todo.description.toLowerCase().includes(textFilter));
		
		// Status filter - check if todo status is in selected statuses array
		const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(todo.status);
		
		// Type filter
		const typeMatch = !typeFilter || todo.type === typeFilter;
		
		return textMatch && statusMatch && typeMatch;
	});
	
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

function clearFilters() {
	document.getElementById('filterText').value = '';
	document.getElementById('filterType').value = '';
	
	// Clear all status selections
	filters.statuses = [];
	
	// Reset filters
	filters = { text: '', statuses: [], type: '' };
	
	// Update visual selection
	updateStatusSelectionVisual();
	
	// Update status button text
	updateStatusButtonText();
	
	filteredTodos = todos;
	renderTodos();
}

function renderTodos() {
	const todoList = document.getElementById('todoList');
	const todosToRender = filteredTodos.length > 0 || hasActiveFilters() ? filteredTodos : todos;
	
	if (todosToRender.length === 0) {
		if (hasActiveFilters()) {
			todoList.innerHTML = '<li class="no-todos">No todos match the current filters.</li>';
		} else {
			todoList.innerHTML = '<li class="no-todos">No todos yet. Click "Add" to create your first todo!</li>';
		}
		return;
	}
	todoList.innerHTML = todosToRender.map(todo => \`
		<li class="todo-item status-\${todo.status} \${todo.status === 'done' ? 'completed' : ''}">
			<div class="todo-header">
				<div class="todo-title-row">
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
					</div>
					<input 
						type="text" 
						class="todo-title \${!todo.title ? 'empty' : ''}" 
						value="\${todo.title}" 
						placeholder="Title"
						onchange="onTitleChange('\${todo.id}', this.value)"
						\${todo.status === 'done' ? 'readonly' : ''}
					/>
				</div>
				<button class="delete-button" onclick="deleteTodo('\${todo.id}')" title="Delete todo">
					×
				</button>
			</div>
			<textarea 
				class="todo-description \${!todo.description ? 'empty' : ''}" 
				placeholder="Description"
				onchange="onDescriptionChange('\${todo.id}', this.value)"
				\${todo.status === 'done' ? 'readonly' : ''}
			>\${todo.description}</textarea>
			<div class="todo-actions">
				<div class="todo-controls">
				</div>
				<select 
					class="type-selector" 
					onchange="onTypeChange('\${todo.id}', this.value)"
					\${todo.status === 'done' ? 'disabled' : ''}
				>
					<option value="workspace" \${todo.type === 'workspace' ? 'selected' : ''}>Workspace</option>
					<option value="global" \${todo.type === 'global' ? 'selected' : ''}>Global</option>
				</select>
			</div>
		</li>
	\`).join('');
}

function hasActiveFilters() {
	return filters.text !== '' || filters.statuses.length > 0 || filters.type !== '';
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
	
	// Close status popups when clicking outside
	document.querySelectorAll('.status-popup.active').forEach(statusPopup => {
		const statusButton = statusPopup.previousElementSibling;
		if (!statusPopup.contains(event.target) && !statusButton.contains(event.target)) {
			statusPopup.classList.remove('active');
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
});

// Initial render
applyFilters();
`;
