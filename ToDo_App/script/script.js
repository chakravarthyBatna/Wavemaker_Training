const inputBox = document.getElementById('input-box');
const taskDueDate = document.getElementById('task-due-date');
const taskDueTime = document.getElementById('task-due-time');
const taskPriority = document.getElementById('task-priority');
const listContainer = document.getElementById('list-container');
const searchBar = document.getElementById('search-bar');
const filterTasks = document.getElementById('filter-tasks');
const sortDueDate = document.getElementById('sort-due-date');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const sortPriority = document.getElementById('sort-priority');

sortPriority.addEventListener('change', showTask); //showTask called when we use the sort by priority 
sortDueDate.addEventListener('change', showTask);  //showTask called when we use the sort by due-date
localStorage.clear();
function addTask() {
    if (inputBox.value === '') {
        alert('You Must Write Something for a Task');
        return;
    }

    const taskName = inputBox.value.trim();
    const dueDate = taskDueDate.value;
    const dueTime = taskDueTime.value;
    const priority = taskPriority.value;

    // Check for duplicate tasks by task name, due date, and due time
    const tasks = Array.from(listContainer.getElementsByClassName('task-item'));
    for (const task of tasks) {
        const taskNameElement = task.querySelector('.task-name');
        const dueDateElement = task.querySelector('.task-due-date');
        const dueTimeElement = task.querySelector('.task-due-time');

        const existingTaskName = taskNameElement ? taskNameElement.textContent.trim() : '';
        const existingDueDate = dueDateElement ? dueDateElement.textContent.trim() : '';
        const existingDueTime = dueTimeElement ? dueTimeElement.textContent.trim() : '';

        if (existingTaskName === taskName && existingDueDate === dueDate && existingDueTime === dueTime) {
            alert('Duplicate task found. Please enter a unique task.');
            return;
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
        <a href="#" id="task-detail" class="task-details">Details</a>
        <a href="#" class="markAsComplete">Mark As Complete</a>
        <a href="#" class="add-subtask">Add Subtask</a>
    `;

    listItem.innerHTML = `
    <div class="task-name">${taskName}</div>
    <div class="task-due-date-time">
        <span class="dot">•</span>
        <span class="due-info">${dueDate}</span>
        <span class="dot">•</span>
        <span class="due-info">${dueTime}</span>
    </div>
`;


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
    initializeDetailsEvent();
    attachAddSubtaskEvent(listItem);
    // showDetailsDialog(listItem);
}
function attachAddSubtaskEvent(taskItem) {
    const taskItems = listContainer.querySelectorAll('.task-item');
    taskItems.forEach(listItem => {
        listItem.querySelector('.add-subtask').onclick = function (event) {
            event.preventDefault();
            openSubtaskDialog(taskItem);
        };
    });
}

function openSubtaskDialog(taskItem) {
    const dialog = document.createElement('div');
    dialog.classList.add('dialog');

    dialog.innerHTML = `
        <h3>Add Subtask</h3>
        <label for="subtask-name">Subtask Name:</label>
        <input type="text" id="subtask-name" placeholder="Enter subtask name">
        <label for="subtask-due-date">Due Date:</label>
        <input type="date" id="subtask-due-date">
        <label for="subtask-due-time">Due Time:</label>
        <input type="time" id="subtask-due-time">
        <button id="confirm-subtask">Confirm</button>
        <button id="cancel-subtask">Cancel</button>
    `;

    document.body.appendChild(dialog);

    const confirmButton = dialog.querySelector('#confirm-subtask');
    const cancelButton = dialog.querySelector('#cancel-subtask');

    confirmButton.addEventListener('click', function () {
        const subtaskName = dialog.querySelector('#subtask-name').value.trim();
        const subtaskDueDate = dialog.querySelector('#subtask-due-date').value;
        const subtaskDueTime = dialog.querySelector('#subtask-due-time').value;
        console.log(subtaskName + subtaskDueDate + subtaskDueTime);
        if (subtaskName === '') {
            alert('Subtask Name is required.');
            return;
        }

        addSubtaskToTask(taskItem, subtaskName, subtaskDueDate, subtaskDueTime);
        document.body.removeChild(dialog);
    });

    cancelButton.addEventListener('click', function () {
        document.body.removeChild(dialog);
    });
}
function addSubtaskToTask(taskItem, subtaskName, subtaskDueDate, subtaskDueTime) {
    let subtaskList = taskItem.querySelector('.subtask-list');
    if (!subtaskList) {
        console.log('No subtask list found, creating a new one.');
        subtaskList = document.createElement('li');
        subtaskList.classList.add('subtask-list');
    } else {
        console.log('Subtask list found.');
    }

    // Create the subtask item
    const subtaskItem = document.createElement('li');
    subtaskItem.classList.add('subtask-item');
    subtaskItem.innerHTML = `
        <div class="subtask-name">${subtaskName}</div>
        <div class="subtask-due-date-time">
            <span class="dot">•</span>
            <span class="due-info">${subtaskDueDate}</span>
            <span class="dot">•</span>
            <span class="due-info">${subtaskDueTime}</span>
        </div>
    `;

    // Append the subtask item to the subtask list
    subtaskList.appendChild(subtaskItem);
    console.log('Subtask item added:', subtaskItem);
    taskItem.appendChild(subtaskList);
    // // Append the subtask list to the task item if it's not already there
    // if (!taskItem.contains(subtaskList)) {
    //     taskItem.appendChild(subtaskList);
    //     console.log('Subtask list appended to task item.');
    // } else {
    //     console.log('Subtask list already present.');
    // }
}


function initializeDetailsEvent() {
    const taskItems = listContainer.querySelectorAll('.task-item');
    taskItems.forEach(listItem => {
        listItem.querySelector('.task-details').onclick = function (event) {
            event.preventDefault();
            showDetailsDialog(listItem);
        };
    });
}
function showDetailsDialog(listItem) {
    // Retrieve task details
    const taskNameElement = listItem.querySelector('.task-name');
    const dueDateElement = listItem.querySelector('.task-due-date-time .due-info:nth-child(2)'); // Updated selector
    const dueTimeElement = listItem.querySelector('.task-due-date-time .due-info:nth-child(4)'); // Updated selector

    const taskName = taskNameElement ? taskNameElement.textContent.trim() : '';
    const taskDueDate = dueDateElement ? dueDateElement.textContent.trim() : '';
    const taskDueTime = dueTimeElement ? dueTimeElement.textContent.trim() : '';

    // Determine priority
    const priority = listItem.classList.contains('task-priority-high') ? 'High' :
        listItem.classList.contains('task-priority-medium') ? 'Medium' : 'Low';

    // Create the details dialog
    const detailsDialog = document.createElement('div');
    detailsDialog.classList.add('details-dialog');
    detailsDialog.innerHTML = `
        <div class="details-dialog-content">
            <h3>Task Details</h3>
            <p><strong>Task Name:</strong> ${taskName}</p>
            <p><strong>Due Date:</strong> ${taskDueDate}</p>
            <p><strong>Due Time:</strong> ${taskDueTime}</p>
            <p><strong>Priority:</strong> ${priority}</p>
            <button id="close-details" class="btn btn-secondary">Go Back</button>
        </div>
    `;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    // Append overlay and dialog to the body
    document.body.appendChild(overlay);
    document.body.appendChild(detailsDialog);

    // Set display to block
    detailsDialog.style.display = 'block';
    overlay.style.display = 'block';

    // Add event listener to close button
    document.getElementById('close-details').onclick = function () {
        document.body.removeChild(detailsDialog);
        document.body.removeChild(overlay);
    };
}


// closes all the dropdown menus if clicked outside
document.addEventListener('click', function (event) {
    if (!event.target.closest('.list-group-item')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
    }
});

function attachEllipsisEvent(ellipsis, listItem) {
    ellipsis.onclick = function (event) {
        event.stopPropagation();
        const menu = listItem.querySelector('.dropdown-menu');
        const isVisible = menu.style.display === 'block';
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
        menu.style.display = isVisible ? 'none' : 'block';
    };
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
    const taskNameElement = listItem.querySelector('.task-name');
    const dueDateElement = listItem.querySelector('.task-due-date-time .due-info:first-child');
    const dueTimeElement = listItem.querySelector('.task-due-date-time .due-info:last-child');

    const taskName = taskNameElement ? taskNameElement.textContent.trim() : '';
    const taskDueDateValue = dueDateElement ? dueDateElement.textContent.trim() : '';
    const taskDueTimeValue = dueTimeElement ? dueTimeElement.textContent.trim() : '';

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

        listItem.innerHTML = `
            <div class="task-name">${editedTaskName}</div>
            <div class="task-due-date-time">
                <span class="dot">•</span>
                <span class="due-info">${editedTaskDueDate}</span>
                <span class="dot">•</span>
                <span class="due-info">${editedTaskDueTime}</span>
            </div>
        `;
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
    const dueDateTime = new Date(`${dueDate}T${dueTime}`).getTime(); //this is due date and time in milliseconds
    const currentTime = Date.now();

    const tenMinutesBefore = dueDateTime - 10 * 60 * 1000; // 10 minutes before
    const oneMinuteBefore = dueDateTime - 1 * 60 * 1000; // 1 minute before
    const atDueTime = dueDateTime; // Exact due time

    // Schedule the notification for 10 minutes before
    if (tenMinutesBefore > currentTime) {
        setTimeout(() => {
            console.log(`Scheduling 10-minute reminder for task "${task}"`);
            new Notification("Task Reminder", {
                body: `Task: ${task}\nDue: ${dueDate} ${dueTime}\nDue in 10 minutes`,
            });
        }, tenMinutesBefore - currentTime);
    } else {
        console.log("10-minute reminder skipped (time already passed).");
    }

    // Schedule the notification for 1 minute before
    if (oneMinuteBefore > currentTime) {
        setTimeout(() => {
            console.log(`Scheduling 1-minute reminder for task "${task}"`);
            new Notification("Task Reminder", {
                body: `Task: ${task}\nDue: ${dueDate} ${dueTime}\nDue in 1 minutes`,
            });
        }, oneMinuteBefore - currentTime);
    } else {
        console.log("1-minute reminder skipped (time already passed).");
    }

    // Schedule the notification for the exact due time
    if (atDueTime > currentTime) {
        setTimeout(() => {
            console.log(`Scheduling exact time reminder for task "${task}"`);
            new Notification("Task Reminder", {
                body: `Task: ${task}\nDue: ${dueDate} ${dueTime}`,
            });
        }, atDueTime - currentTime);
    } else {
        console.log("Exact time reminder skipped (time already passed).");
    }
}

function saveData() {
    localStorage.setItem('data', listContainer.innerHTML);
}

function showTask() {
    // Load tasks from localStorage
    listContainer.innerHTML = localStorage.getItem('data') || '';
    const tasks = Array.from(listContainer.querySelectorAll('.task-item'));

    const sortByPriority = sortPriority.value;
    const sortByDueDate = sortDueDate.value;

    // Sort tasks
    tasks.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const priorityA = a.classList.contains('task-priority-high') ? 'high' :
            a.classList.contains('task-priority-medium') ? 'medium' : 'low';
        const priorityB = b.classList.contains('task-priority-high') ? 'high' :
            b.classList.contains('task-priority-medium') ? 'medium' : 'low';

        // Sorting by priority
        if (sortByPriority === 'asc' || sortByPriority === 'desc') {
            return sortByPriority === 'asc' ? priorityOrder[priorityA] - priorityOrder[priorityB] : priorityOrder[priorityB] - priorityOrder[priorityA];
        }

        // Sorting by due date
        if (sortByDueDate === 'asc' || sortByDueDate === 'desc') {
            const dueDateA = a.querySelector('.task-due-date-time .due-info:nth-child(2)').textContent.trim();
            const dueDateB = b.querySelector('.task-due-date-time .due-info:nth-child(2)').textContent.trim();
            const dateA = new Date(dueDateA);
            const dateB = new Date(dueDateB);

            return sortByDueDate === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Default sorting by priority
        return priorityOrder[priorityA] - priorityOrder[priorityB];
    });

    // Append sorted tasks
    tasks.forEach(task => listContainer.appendChild(task));

    // Re-initialize functionalities
    initializeSortable();  //drag and drop
    initializeEllipsisMenu();  //ellipsis (the three dots)
    initializeEditDeleteEvents(); //edit and delete buttons
    initializeDetailsEvent(); // for details button
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

    const completedDateTime = new Date().toLocaleString();
    const completionInfo = document.createElement('span');
    completionInfo.className = 'completion-info';
    completionInfo.innerHTML = `&bull; Completed on: ${completedDateTime}`;

    listItem.appendChild(completionInfo);

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
    const filter = filterTasks.value; //low or medium or hard
    const tasks = listContainer.getElementsByClassName('task-item');

    Array.from(tasks).forEach(task => {
        task.style.display = (filter === 'all' || task.classList.contains(`task-priority-${filter}`)) ? '' : 'none';
    });
});


darkModeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Initialize dark mode based on user preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

showTask();
initializeSortable();
