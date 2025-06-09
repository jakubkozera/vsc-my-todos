import { STYLES } from "./styles";
import { SCRIPT } from "./script";

export function getWebviewContent(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>My Todos</title>
	<style>
		${STYLES}
	</style>
</head>
<body>	<div class="header">
		<button class="filter-button" onclick="toggleFilterPopup()" title="Filter todos">
			<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"></path>
			</svg>
		</button>
		<button class="add-button" onclick="addTodo()">
			<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
			</svg>
			Add
		</button>
	</div>

	<!-- Filter Popup -->
	<div class="filter-popup" id="filterPopup">
		<div class="filter-popup-content">
			<div class="filter-header">
				<h4>Filter Todos</h4>
				<button class="close-button" onclick="toggleFilterPopup()">×</button>
			</div>
			<div class="filter-body">
				<div class="filter-group">
					<label for="filterText">Search title/description:</label>
					<input type="text" id="filterText" placeholder="Enter search text..." oninput="applyFilters()">
				</div>
				<div class="filter-group">
					<label for="filterStatus">Status:</label>
					<select id="filterStatus" onchange="applyFilters()">
						<option value="">All statuses</option>
						<option value="todo">To do</option>
						<option value="inprogress">In progress</option>
						<option value="done">Done</option>
						<option value="blocked">Blocked</option>
					</select>
				</div>
				<div class="filter-group">
					<label for="filterType">Type:</label>
					<select id="filterType" onchange="applyFilters()">
						<option value="">All types</option>
						<option value="workspace">Workspace</option>
						<option value="global">Global</option>
					</select>
				</div>
				<div class="filter-actions">
					<button class="clear-button" onclick="clearFilters()">Clear All</button>
				</div>
			</div>
		</div>
	</div>
	
	<ul class="todo-list" id="todoList">
		<li class="no-todos">No todos yet. Click "Add" to create your first todo!</li>
	</ul>

	<script>
		${SCRIPT}
	</script>
</body>
</html>`;
}
