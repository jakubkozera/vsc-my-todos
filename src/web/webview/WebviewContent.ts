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
				</div>				<div class="filter-group">
					<label for="filterStatus">Status:</label>
					<div class="custom-status-dropdown">
						<button class="status-dropdown-button" onclick="toggleStatusDropdown()" id="statusDropdownButton">
							<span class="status-dropdown-text">All statuses</span>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>						<div class="status-dropdown-menu" id="statusDropdownMenu">
							<div class="status-dropdown-option" data-value="todo" onclick="toggleStatusSelection('todo')">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="8" fill="#007acc" />
								</svg>
								<span>To do</span>
							</div>
							<div class="status-dropdown-option" data-value="inprogress" onclick="toggleStatusSelection('inprogress')">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="8" fill="#ff8c00" />
								</svg>
								<span>In progress</span>
							</div>
							<div class="status-dropdown-option" data-value="done" onclick="toggleStatusSelection('done')">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="8" fill="#28a745" />
								</svg>
								<span>Done</span>
							</div>
							<div class="status-dropdown-option" data-value="blocked" onclick="toggleStatusSelection('blocked')">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="8" fill="#dc3545" />
								</svg>
								<span>Blocked</span>
							</div>
							<div class="status-dropdown-actions">
								<button class="status-clear-all" onclick="clearAllStatuses()">Clear All</button>
								<button class="status-select-all" onclick="selectAllStatuses()">Select All</button>
							</div>
						</div>
					</div>
				</div>				<div class="filter-group">
					<label>Type:</label>
					<div class="type-dropdown">
						<button class="type-dropdown-button" id="typeDropdownButton" onclick="toggleTypeDropdown()">
							<span class="type-dropdown-text">All types</span>
							<svg class="type-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
						<div class="type-dropdown-menu" id="typeDropdownMenu">
							<div class="type-dropdown-option" data-value="workspace" onclick="toggleTypeSelection('workspace')">
								<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"></path>
								</svg>
								<span>Workspace</span>
							</div>
							<div class="type-dropdown-option" data-value="global" onclick="toggleTypeSelection('global')">
								<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"></path>
								</svg>
								<span>Global</span>
							</div>
							<div class="type-dropdown-actions">
								<button class="type-clear-all" onclick="clearAllTypes()">Clear All</button>
								<button class="type-select-all" onclick="selectAllTypes()">Select All</button>
							</div>
						</div>
					</div>
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
