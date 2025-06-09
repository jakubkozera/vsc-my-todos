export const SCRIPT = `
const vscode = acquireVsCodeApi();
let todos = [];

window.addEventListener('message', event => {
	const message = event.data;
	switch (message.type) {
		case 'updateTodos':
			todos = message.todos;
			renderTodos();
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

function renderTodos() {
	const todoList = document.getElementById('todoList');
	
	if (todos.length === 0) {
		todoList.innerHTML = '<li class="no-todos">No todos yet. Click "Add" to create your first todo!</li>';
		return;
	}	todoList.innerHTML = todos.map(todo => \`
		<li class="todo-item status-\${todo.status} \${todo.status === 'done' ? 'completed' : ''}">
			<div class="todo-header">
				<input 
					type="text" 
					class="todo-title \${!todo.title ? 'empty' : ''}" 
					value="\${todo.title}" 
					placeholder="Title"
					onchange="onTitleChange('\${todo.id}', this.value)"
					\${todo.status === 'done' ? 'readonly' : ''}
				/>
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
			<div class="todo-actions">				<div class="todo-controls">
					<select 
						class="status-selector" 
						onchange="onStatusChange('\${todo.id}', this.value)"
					>
						<option value="todo" \${todo.status === 'todo' ? 'selected' : ''}>To do</option>
						<option value="inprogress" \${todo.status === 'inprogress' ? 'selected' : ''}>In progress</option>
						<option value="done" \${todo.status === 'done' ? 'selected' : ''}>Done</option>
						<option value="blocked" \${todo.status === 'blocked' ? 'selected' : ''}>Blocked</option>
					</select>
				</div>				<select 
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

// Initial render
renderTodos();
`;
