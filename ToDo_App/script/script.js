const inputBox = document.getElementById('input-box');
const taskDueDate = document.getElementById('task-due-date');
const taskDueTime = document.getElementById('task-due-time');
const taskPriority = document.getElementById('task-priority');
const listContainer = document.getElementById('list-container');
const searchBar = document.getElementById('search-bar');
const filterTasks = document.getElementById('filter-tasks');
const sortDueDate = document.getElementById('sort-due-date');
const darkModeToggle = document.getElementById('dark-mode-toggle');
// localStorage.clear();
function addTask() {
    if (inputBox.value === '') {
        alert('You Must Write Something for a Task');
        return;
    }

    const taskName = inputBox.value.trim();
    const dueDate = taskDueDate.value;
    const dueTime = taskDueTime.value;
    const priority = taskPriority.value;

    // Check for duplicate tasks by task name
    const tasks = Array.from(listContainer.getElementsByClassName('task-item'));
    for (const task of tasks) {
        const taskText = task.firstChild.textContent.trim();
        const taskDetails = taskText.match(/(.*) \(Due: (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})\)/);
        if (taskDetails) {
            const existingTaskName = taskDetails[1].trim();

            if (existingTaskName === taskName) {
                alert('Duplicate task found. Please enter a unique task.');
                return;
            }
        }
    }

    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'task-item');

    switch (priority) {
        case 'low':
            listItem.classList.add('task-priority-low');
            break;
        case 'medium':
            listItem.classList.add('task-priority-medium');
            break;
        case 'high':
            listItem.classList.add('task-priority-high');
            break;
        default:
            listItem.classList.add('task-priority-low');
    }

    const ellipsis = document.createElement('span');
    ellipsis.classList.add('ellipsis-menu');
    ellipsis.innerHTML = '&#8226;&#8226;&#8226;';

    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu');
    dropdownMenu.innerHTML = `
        <a href="#" class="edit-task">Edit</a>
        <a href="#" class="delete-task">Delete</a>
        <a href="#" class="task-details">Details</a>
        <a href="#" class="markAsComplete">Mark As Complete</a>
    `;

    listItem.innerHTML = `${taskName} (Due: ${dueDate} ${dueTime}) `;
    listItem.appendChild(ellipsis);
    listItem.appendChild(dropdownMenu);

    listContainer.appendChild(listItem);

    inputBox.value = '';
    taskDueDate.value = '';
    taskDueTime.value = '';
    taskPriority.value = 'low';

    // Schedule notification
    if (dueDate && dueTime) {
        scheduleNotification(taskName, dueDate, dueTime);
    }

    saveData();
    showTask();
    attachEllipsisEvent(ellipsis, listItem);
    attachEditDeleteEvents(listItem);
}


function attachEllipsisEvent(ellipsis, listItem) {
    ellipsis.onclick = function (event) {
        event.stopPropagation();
        const menu = listItem.querySelector('.dropdown-menu');
        const isVisible = menu.style.display === 'block';
        document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
        menu.style.display = isVisible ? 'none' : 'block';
    };

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.list-group-item')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
        }
    });
}

function attachEditDeleteEvents(listItem) {
    listItem.querySelector('.edit-task').onclick = function (event) {
        event.preventDefault();
        showEditDialog(listItem);
    };

    listItem.querySelector('.delete-task').onclick = function (event) {
        event.preventDefault();
        deleteTask(listItem);
    };

    listItem.querySelector('.markAsComplete').onclick = function (event) {
        event.preventDefault();
        markAsComplete(listItem);
    };
}

function showEditDialog(listItem) {
    const taskText = listItem.firstChild.textContent.trim();
    const taskDetails = taskText.match(/(.*) \(Due: (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})\)/);
    if (!taskDetails) {
        alert('Failed to parse task details.');
        return;
    }
    const taskName = taskDetails[1];
    const taskDueDateValue = taskDetails[2];
    const taskDueTimeValue = taskDetails[3];

    const priority = listItem.classList.contains('task-priority-high') ? 'high' :
                     listItem.classList.contains('task-priority-medium') ? 'medium' : 'low';

    const editDialog = document.createElement('div');
    editDialog.classList.add('edit-dialog');
    editDialog.innerHTML = `
        <div class="edit-dialog-content">
            <h3>Edit Task</h3>
            <input type="text" id="edit-task-name" class="form-control" value="${taskName}">
            <input type="date" id="edit-task-due-date" class="form-control" value="${taskDueDateValue}">
            <input type="time" id="edit-task-due-time" class="form-control" value="${taskDueTimeValue}">
            <select id="edit-task-priority" class="form-control">
                <option value="low" ${priority === 'low' ? 'selected' : ''}>Low Priority</option>
                <option value="medium" ${priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
                <option value="high" ${priority === 'high' ? 'selected' : ''}>High Priority</option>
            </select>
            <button id="save-edit" class="btn btn-primary">Save</button>
            <button id="cancel-edit" class="btn btn-secondary">Cancel</button>
        </div>
    `;

    document.body.appendChild(editDialog);

    document.getElementById('save-edit').onclick = function () {
        const editedTaskName = document.getElementById('edit-task-name').value;
        const editedTaskDueDate = document.getElementById('edit-task-due-date').value;
        const editedTaskDueTime = document.getElementById('edit-task-due-time').value;
        const editedTaskPriority = document.getElementById('edit-task-priority').value;

        listItem.innerHTML = `${editedTaskName} (Due: ${editedTaskDueDate} ${editedTaskDueTime}) `;
        listItem.classList.remove('task-priority-low', 'task-priority-medium', 'task-priority-high');

        switch (editedTaskPriority) {
            case 'low':
                listItem.classList.add('task-priority-low');
                break;
            case 'medium':
                listItem.classList.add('task-priority-medium');
                break;
            case 'high':
                listItem.classList.add('task-priority-high');
                break;
            default:
                listItem.classList.add('task-priority-low');
        }

        const ellipsis = document.createElement('span');
        ellipsis.classList.add('ellipsis-menu');
        ellipsis.innerHTML = '&#8226;&#8226;&#8226;';
        const dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('dropdown-menu');
        dropdownMenu.innerHTML = `
            <a href="#" class="edit-task">Edit</a>
            <a href="#" class="delete-task">Delete</a>
            <a href="#" class="task-details">Details</a>
            <a href="#" class="markAsComplete">Mark As Complete</a>
        `;
        listItem.appendChild(ellipsis);
        listItem.appendChild(dropdownMenu);
        attachEllipsisEvent(ellipsis, listItem);
        attachEditDeleteEvents(listItem);
        saveData();
        document.body.removeChild(editDialog);
    };

    document.getElementById('cancel-edit').onclick = function () {
        document.body.removeChild(editDialog);
    };
}

function scheduleNotification(task, dueDate, dueTime) {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications");
        return;
    }

    if (Notification.permission === "granted") {
        createNotification(task, dueDate, dueTime);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                createNotification(task, dueDate, dueTime);
            }
        });
    }
}

function createNotification(task, dueDate, dueTime) {
    const dueDateTime = new Date(`${dueDate}T${dueTime}`);
    const duration = dueDateTime.getTime() - Date.now();

    if (duration > 0) {
        setTimeout(() => {
            new Notification("Task Reminder", {
                body: `Task: ${task}\nDue: ${dueDate} ${dueTime}`,
                icon: 'path/to/icon.png'
            });
        }, duration);
    } else {
        console.log("Due date and time are in the past. Notification not scheduled.");
    }
}

function saveData() {
    localStorage.setItem('data', listContainer.innerHTML);
}

const sortPriority = document.getElementById('sort-priority');
sortPriority.addEventListener('change', function () {
    showTask();
});

function showTask() {
    // Get tasks from localStorage and parse the HTML
    listContainer.innerHTML = localStorage.getItem('data') || '';

    const tasks = Array.from(listContainer.querySelectorAll('.task-item'));

    const sortByPriority = sortPriority.value;
    const sortByDueDate = sortDueDate.value;

    if (sortByPriority === 'asc' || sortByPriority === 'desc') {
        tasks.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const priorityA = a.classList.contains('task-priority-high') ? 'high' :
                a.classList.contains('task-priority-medium') ? 'medium' : 'low';
            const priorityB = b.classList.contains('task-priority-high') ? 'high' :
                b.classList.contains('task-priority-medium') ? 'medium' : 'low';
            return sortByPriority === 'asc' ? priorityOrder[priorityA] - priorityOrder[priorityB] : priorityOrder[priorityB] - priorityOrder[priorityA];
        });
    } else if (sortByDueDate === 'asc' || sortByDueDate === 'desc') {
        tasks.sort((a, b) => {
            const dueDateA = a.innerText.match(/Due: (\d{4}-\d{2}-\d{2})/)[1];
            const dueDateB = b.innerText.match(/Due: (\d{4}-\d{2}-\d{2})/)[1];

            const dateA = new Date(dueDateA);
            const dateB = new Date(dueDateB);

            return sortByDueDate === 'asc' ? dateA - dateB : dateB - dateA;
        });
    } else {
        tasks.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const priorityA = a.classList.contains('task-priority-high') ? 'high' :
                a.classList.contains('task-priority-medium') ? 'medium' : 'low';
            const priorityB = b.classList.contains('task-priority-high') ? 'high' :
                b.classList.contains('task-priority-medium') ? 'medium' : 'low';
            return priorityOrder[priorityA] - priorityOrder[priorityB];
        });
    }

    tasks.forEach(task => listContainer.appendChild(task));

    // Initialize functionalities
    initializeSortable();
    initializeEllipsisMenu();
    initializeEditDeleteEvents();
}

function initializeEditDeleteEvents() {
    const taskItems = listContainer.querySelectorAll('.task-item');
    taskItems.forEach(listItem => {
        attachEditDeleteEvents(listItem);
    });
}

function deleteTask(listItem) {
    listItem.remove();
    saveData();
    showTask();
}

function markAsComplete(listItem) {
    const completedListContainer = document.getElementById('completed-list-container');
    completedListContainer.appendChild(listItem);
    listItem.classList.add('completed');
    saveData();
}

function initializeSortable() {
    new Sortable(listContainer, {
        animation: 150,
        onEnd: function () {
            saveData();
        }
    });

    new Sortable(document.getElementById('completed-list-container'), {
        animation: 150,
        onEnd: function () {
            saveData();
        }
    });
}

function initializeEllipsisMenu() {
    const ellipsisMenus = document.querySelectorAll('.ellipsis-menu');
    ellipsisMenus.forEach(ellipsis => {
        const listItem = ellipsis.closest('.list-group-item');
        attachEllipsisEvent(ellipsis, listItem);
    });
}

searchBar.addEventListener('input', function () {
    const filter = searchBar.value.toLowerCase();
    const tasks = listContainer.getElementsByClassName('task-item');

    Array.from(tasks).forEach(task => {
        const taskText = task.textContent || task.innerText;
        task.style.display = taskText.toLowerCase().includes(filter) ? '' : 'none';
    });
});

filterTasks.addEventListener('change', function () {
    const filter = filterTasks.value;
    const tasks = listContainer.getElementsByClassName('task-item');

    Array.from(tasks).forEach(task => {
        task.style.display = (filter === 'all' || task.classList.contains(`task-priority-${filter}`)) ? '' : 'none';
    });
});

sortDueDate.addEventListener('change', function () {
    showTask();
});

darkModeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
});

showTask();
initializeSortable();
