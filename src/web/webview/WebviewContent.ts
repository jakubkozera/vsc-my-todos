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
		<button class="add-button" onclick="addTodo()">
			<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
			</svg>
			Add
		</button>
		<div class="header-right-actions">
			<button class="sort-button" onclick="toggleSortPopup()" title="Sort todos">
				<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18M3 12h18m-9 5h9"></path>
				</svg>
			</button>
			<button class="filter-button" onclick="toggleFilterPopup()" title="Filter todos">
				<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"></path>
				</svg>
			</button>
		</div>
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
		</div>	</div>
	<!-- Sort Popup -->
	<div class="sort-popup" id="sortPopup">
		<div class="sort-popup-content">
			<div class="sort-header">
				<h4>Sort Todos</h4>
				<button class="close-button" onclick="toggleSortPopup()">×</button>
			</div>
			<div class="sort-body">
				<div class="sort-group">
					<label>Sort by:</label>
					<div class="sort-by-dropdown">
						<button class="sort-by-dropdown-button" onclick="toggleSortByDropdown()" id="sortByDropdownButton">
							<span class="sort-by-dropdown-text">Type</span>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
						<div class="sort-by-dropdown-menu" id="sortByDropdownMenu">
							<div class="sort-by-dropdown-option selected" data-value="type" onclick="selectSortBy('type')">
								<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"></path>
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z"></path>
								</svg>
								<span>Type</span>
							</div>
							<div class="sort-by-dropdown-option" data-value="status" onclick="selectSortBy('status')">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="8" fill="#007acc" />
								</svg>
								<span>Status</span>
							</div>
							<div class="sort-by-dropdown-option" data-value="created" onclick="selectSortBy('created')">
								<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"></path>
								</svg>
								<span>Created Date</span>
							</div>
						</div>
					</div>
				</div>
				<div class="sort-group">
					<label>Sort order:</label>
					<div class="sort-order-dropdown">
						<button class="sort-order-dropdown-button" onclick="toggleSortOrderDropdown()" id="sortOrderDropdownButton">
							<span class="sort-order-dropdown-text">Descending</span>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</button>
						<div class="sort-order-dropdown-menu" id="sortOrderDropdownMenu">
							<div class="sort-order-dropdown-option selected" data-value="desc" onclick="selectSortOrder('desc')">
								<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m6.75 4.5L21 14.25m0 0L18 11.25m3 3H7.5"></path>
								</svg>
								<span>Descending</span>
							</div>
							<div class="sort-order-dropdown-option" data-value="asc" onclick="selectSortOrder('asc')">
								<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m0 0-3-3m3 3-3 3M21 14.25H10.5"></path>
								</svg>
								<span>Ascending</span>
							</div>					</div>
				</div>
				<div class="sort-actions">
					<button class="reset-sort-button" onclick="resetSort()">Reset to Default</button>
				</div>
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
