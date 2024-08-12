const inputBox = document.getElementById('input-box');
const taskDueDate = document.getElementById('task-due-date');
const taskDueTime = document.getElementById('task-due-time');
const taskPriority = document.getElementById('task-priority');
const listContainer = document.getElementById('list-container');
const completedListContainer = document.getElementById('completed-list-container');
const searchBar = document.getElementById('search-bar');
const filterTasks = document.getElementById('filter-tasks');
const sortDueDate = document.getElementById('sort-due-date');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const sortPriority = document.getElementById('sort-priority');
// localStorage.clear()
showAllTasks();
initializeSortable();

sortPriority.addEventListener('change', showAllTasks); //showAllTasks called when we use the sort by priority 
sortDueDate.addEventListener('change', showAllTasks);  //showAllTasks called when we use the sort by due-date
// localStorage.clear();
function addTask() {
    // Get form fields
    const taskName = inputBox.value.trim();
    const dueDate = taskDueDate.value;
    const dueTime = taskDueTime.value;
    const priority = taskPriority.value;

    if (!taskName) {
        alert('You must write something for a task.');
        return;
    }

    // Check for duplicate tasks
    if (checkDuplicate(taskName, dueDate, dueTime)) {
        alert('Duplicate task found. Please enter a unique task.');
        return;
    }

    // Save task data
    saveTaskToLocalStorage(taskName, dueDate, dueTime, priority);

    // Schedule notification
    if (dueDate && dueTime) {
        scheduleNotification(taskName, dueDate, dueTime);
    }

    // Show updated task list
    showAllTasks();

    // Clear input fields
    inputBox.value = '';
    taskDueDate.value = '';
    taskDueTime.value = '';
    taskPriority.value = 'low';
}


function checkDuplicate(taskName, dueDate, dueTime) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return tasks.some(task =>
        task.taskName === taskName
    );
}

function saveTaskToLocalStorage(taskName, dueDate, dueTime, priority) {

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const uuid = Math.random().toString(16);
    console.log(uuid);
    const newTask = {
        taskUUID: uuid,
        taskName: taskName,
        dueDate: dueDate,
        dueTime: dueTime,
        priority: priority,
        subtasks: []
    };

    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showAllTasks() {
    // Fetch and display pending tasks
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    showPendingTasks(tasks);

    // Fetch and display completed tasks
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
    showCompletedTasks(completedTasks);
}


function showCompletedTasks(tasks) {
    const completedListContainer = document.getElementById('completed-list-container');
    completedListContainer.innerHTML = ''; // Clear any existing content
    const listItems = buildHtmlForEachCompletedTask(tasks);
    listItems.forEach(item => completedListContainer.appendChild(item));
}

function buildHtmlForEachCompletedTask(tasks) {
    const listItems = [];

    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'task-item');

        switch (task.priority) {
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
            <a href="#" class="add-subtask">Add Subtask</a>
        `;

        listItem.innerHTML = `
            <div display="hidden">${task.taskUUID}</div>
            <div class="task-name">${task.taskName}</div>
            <div class="task-due-date-time">
                <span class="due-info">${task.dueDate}</span>
                <span class="due-info">${task.dueTime}</span>
            </div>
        `;

        // Check if there are any subtasks
        if (task.subtasks && task.subtasks.length > 0) {
            const subtaskList = document.createElement('ul');
            subtaskList.classList.add('subtask-list');

            task.subtasks.forEach((subtask, index) => {
                const subtaskItem = document.createElement('li');
                subtaskItem.classList.add('subtask-item');
                subtaskItem.innerHTML = `
                    <div class="subtask-name">${subtask.subtaskName}</div>
                     <div class="subtask-due-date-time">
                        <span class="due-info">${subtask.subtaskDueDate}</span>
                        <span class="due-info">${subtask.subtaskDueTime}</span>
                     </div>
                    <button class="edit-subtask" data-index="${index}">Edit</button>
                    <button class="delete-subtask" data-index="${index}">Delete</button>
                `;
                subtaskList.appendChild(subtaskItem);
            });

            listItem.appendChild(subtaskList);
        }

        listItem.appendChild(ellipsis);
        listItem.appendChild(dropdownMenu);
        listItems.push(listItem); // Collect the list item
        attachAddSubtaskEvent(listItem);
    });

    return listItems; // Return all list items as an array
}

function showPendingTasks(tasks) {
    // Clear the current task list in the UI
    listContainer.innerHTML = '';

    // Sort tasks based on priority and due date
    tasks.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityComparison !== 0) return priorityComparison;

        const dateComparison = new Date(a.dueDate) - new Date(b.dueDate);
        return dateComparison;
    });
    buildHtmlForEachPendingTask(tasks);
    // Re-initialize functionalities for the new task items
    initializeSortable();  // Drag and drop
    initializeEllipsisMenu();  // Ellipsis menu (three dots)
    initializeEditDeleteEvents(); // Edit and delete buttons
    initializeDetailsEvent(); // Details button
    initializeSubtaskEvents(); // Edit and delete buttons for subtask
}


function buildHtmlForEachPendingTask(tasks) {
    // Build the HTML for each task and append it to the UI
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'task-item');
        // Set task UUID as a hidden div
        const uuidDiv = document.createElement('div');
        uuidDiv.style.display = 'none'; // This hides the element
        uuidDiv.textContent = task.taskUUID;
        listItem.appendChild(uuidDiv);

        switch (task.priority) {
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
            <a href="#" class="add-subtask">Add Subtask</a>
        `;

        listItem.innerHTML = `
           <div style="display: none;">${task.taskUUID}</div>
            <div class="task-name">${task.taskName}</div>
            <div class="task-due-date-time">
                <span class="due-info">${task.dueDate}</span>
                <span class="due-info">${task.dueTime}</span>
            </div>
        `;

        // Check if there are any subtasks
        if (task.subtasks && task.subtasks.length > 0) {
            const subtaskList = document.createElement('ul');
            subtaskList.classList.add('subtask-list');

            task.subtasks.forEach((subtask, index) => {
                const subtaskItem = document.createElement('li');
                subtaskItem.classList.add('subtask-item');
                subtaskItem.innerHTML = `
                    <div class="subtask-name">${subtask.subtaskName}</div>
                     <div class="subtask-due-date-time">
                        <span class="due-info">${subtask.subtaskDueDate}</span>
                        <span class="due-info">${subtask.subtaskDueTime}</span>
                     </div>
                    <button class="edit-subtask" data-index="${index}">Edit</button>
                    <button class="delete-subtask" data-index="${index}">Delete</button>
                `;
                subtaskList.appendChild(subtaskItem);
            });

            listItem.appendChild(subtaskList);
        }

        listItem.appendChild(ellipsis);
        listItem.appendChild(dropdownMenu);
        listContainer.appendChild(listItem);
        attachAddSubtaskEvent(listItem);
    });
}
function initializeSubtaskEvents() {
    const subtaskItems = listContainer.querySelectorAll('.subtask-item');
    subtaskItems.forEach(subtaskItem => {
        const editButton = subtaskItem.querySelector('.edit-subtask');
        const deleteButton = subtaskItem.querySelector('.delete-subtask');

        if (editButton) {
            editButton.onclick = function (event) {
                event.preventDefault();
                const index = editButton.getAttribute('data-index');
                const taskItem = subtaskItem.closest('.task-item');
                openEditSubtaskDialog(taskItem, index);
            };
        }

        if (deleteButton) {
            deleteButton.onclick = function (event) {
                event.preventDefault();
                const index = deleteButton.getAttribute('data-index');
                const taskItem = subtaskItem.closest('.task-item');
                deleteSubtask(taskItem, index);
            };
        }
    });
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

    const taskNameElement = taskItem.querySelector('.task-name');
    const dueDateElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(1)');
    const dueTimeElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(2)');

    const taskName = taskNameElement ? taskNameElement.textContent.trim() : '';
    const dueDate = dueDateElement ? dueDateElement.textContent.trim() : '';
    const dueTime = dueTimeElement ? dueTimeElement.textContent.trim() : '';

    dialog.innerHTML = `
        <h3>Add Subtask</h3>
        <label for="subtask-name">Subtask Name:</label>
        <input type="text" id="subtask-name" placeholder="Enter subtask name">
        <label for="subtask-due-date">Due Date:</label>
        <input type="date" id="subtask-due-date">
        <label for="subtask-due-time">Due Time:</label>
        <input type="time" id="subtask-due-time">
        <button id="confirm-add-subtask">Add</button>
        <button id="cancel-add-subtask">Cancel</button>
    `;

    document.body.appendChild(dialog);

    const confirmButton = dialog.querySelector('#confirm-add-subtask');
    const cancelButton = dialog.querySelector('#cancel-add-subtask');

    confirmButton.addEventListener('click', function () {
        const subtaskName = dialog.querySelector('#subtask-name').value.trim();
        const subtaskDueDate = dialog.querySelector('#subtask-due-date').value;
        const subtaskDueTime = dialog.querySelector('#subtask-due-time').value;

        if (subtaskName === '') {
            alert('Subtask Name is required.');
            return;
        }

        // Get the task details
        const taskNameElement = taskItem.querySelector('.task-name');
        const dueDateElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(1)');
        const dueTimeElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(2)');

        const taskName = taskNameElement ? taskNameElement.textContent.trim() : '';
        const dueDate = dueDateElement ? dueDateElement.textContent.trim() : '';
        const dueTime = dueTimeElement ? dueTimeElement.textContent.trim() : '';
        addSubtaskToTask(taskName, dueDate, dueTime, subtaskName, subtaskDueDate, subtaskDueTime);
        document.body.removeChild(dialog);
    });

    cancelButton.addEventListener('click', function () {
        document.body.removeChild(dialog);
    });
}


function openEditSubtaskDialog(taskItem, subtaskIndex) {
    const dialog = document.createElement('div');
    dialog.classList.add('dialog');

    const taskNameElement = taskItem.querySelector('.task-name');
    const dueDateElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(1)');
    const dueTimeElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(2)');

    const taskName = taskNameElement ? taskNameElement.textContent.trim() : '';
    const dueDate = dueDateElement ? dueDateElement.textContent.trim() : '';
    const dueTime = dueTimeElement ? dueTimeElement.textContent.trim() : '';

    dialog.innerHTML = `
        <h3>Edit Subtask</h3>
        <label for="edit-subtask-name">Subtask Name:</label>
        <input type="text" id="edit-subtask-name" placeholder="Enter subtask name">
        <label for="edit-subtask-due-date">Due Date:</label>
        <input type="date" id="edit-subtask-due-date">
        <label for="edit-subtask-due-time">Due Time:</label>
        <input type="time" id="edit-subtask-due-time">
        <button id="confirm-edit-subtask">Confirm</button>
        <button id="cancel-edit-subtask">Cancel</button>
    `;

    document.body.appendChild(dialog);

    const confirmButton = dialog.querySelector('#confirm-edit-subtask');
    const cancelButton = dialog.querySelector('#cancel-edit-subtask');

    confirmButton.addEventListener('click', function () {
        const subtaskName = dialog.querySelector('#edit-subtask-name').value.trim();
        const subtaskDueDate = dialog.querySelector('#edit-subtask-due-date').value;
        const subtaskDueTime = dialog.querySelector('#edit-subtask-due-time').value;

        if (subtaskName === '') {
            alert('Subtask Name is required.');
            return;
        }

        updateSubtask(taskItem, subtaskIndex, subtaskName, subtaskDueDate, subtaskDueTime);
        document.body.removeChild(dialog);
    });

    cancelButton.addEventListener('click', function () {
        document.body.removeChild(dialog);
    });
}

function updateSubtask(taskItem, subtaskIndex, subtaskName, subtaskDueDate, subtaskDueTime) {
    // Retrieve the tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Get the task details
    const taskNameElement = taskItem.querySelector('.task-name');
    const dueDateElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(1)');
    const dueTimeElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(2)');

    const taskName = taskNameElement ? taskNameElement.textContent.trim() : '';
    const dueDate = dueDateElement ? dueDateElement.textContent.trim() : '';
    const dueTime = dueTimeElement ? dueTimeElement.textContent.trim() : '';

    // Find the task in localStorage
    tasks = tasks.map(task => {
        if (task.taskName === taskName && task.dueDate === dueDate && task.dueTime === dueTime) {
            // Update the subtask
            task.subtasks[subtaskIndex] = {
                subtaskName: subtaskName,
                subtaskDueDate: subtaskDueDate,
                subtaskDueTime: subtaskDueTime
            };
        }
        return task;
    });

    // Save the updated tasks back to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Update the UI with the updated subtask
    const subtaskItem = taskItem.querySelector(`.subtask-item:nth-child(${parseInt(subtaskIndex) + 1})`);
    if (subtaskItem) {
        subtaskItem.querySelector('.subtask-name').textContent = subtaskName;
        subtaskItem.querySelector('.subtask-due-date-time .due-info:nth-child(1)').textContent = subtaskDueDate;
        subtaskItem.querySelector('.subtask-due-date-time .due-info:nth-child(2)').textContent = subtaskDueTime;
    }
}

function deleteSubtask(taskItem, subtaskIndex) {
    // Retrieve the tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Get the task details
    const taskNameElement = taskItem.querySelector('.task-name');
    const dueDateElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(1)');
    const dueTimeElement = taskItem.querySelector('.task-due-date-time .due-info:nth-child(2)');

    const taskName = taskNameElement ? taskNameElement.textContent.trim() : '';
    const dueDate = dueDateElement ? dueDateElement.textContent.trim() : '';
    const dueTime = dueTimeElement ? dueTimeElement.textContent.trim() : '';

    // Find the task in localStorage and remove the subtask
    tasks = tasks.map(task => {
        if (task.taskName === taskName && task.dueDate === dueDate && task.dueTime === dueTime) {
            task.subtasks.splice(subtaskIndex, 1);
        }
        return task;
    });

    // Save the updated tasks back to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Remove the subtask item from the UI
    const subtaskItem = taskItem.querySelector(`.subtask-item:nth-child(${parseInt(subtaskIndex) + 1})`);
    if (subtaskItem) {
        subtaskItem.remove();
    }
}

function addSubtaskToTask(taskName, dueDate, dueTime, subtaskName, subtaskDueDate, subtaskDueTime) {

    addSubtaskToLocalStorage(taskName, dueDate, dueTime, subtaskName, subtaskDueDate, subtaskDueTime);

    showAllTasks();
}


function addSubtaskToLocalStorage(taskName, dueDate, dueTime, subtaskName, subtaskDueDate, subtaskDueTime) {
    // Retrieve the tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];


    // Find the task in localStorage
    tasks = tasks.map(task => {
        if (task.taskName === taskName) {
            // Add the new subtask
            task.subtasks.push({
                subtaskName: subtaskName,
                subtaskDueDate: subtaskDueDate,
                subtaskDueTime: subtaskDueTime
            });
        }
        return task;
    });

    // Save the updated tasks back to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
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
    const dueDateElement = listItem.querySelector('.task-due-date-time .due-info:nth-child(1)'); // Updated selector
    const dueTimeElement = listItem.querySelector('.task-due-date-time .due-info:nth-child(2)'); // Updated selector

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

function showEditDialog(listItem) {
    const taskNameElement = listItem.querySelector('.task-name');
    const dueDateElement = listItem.querySelector('.task-due-date-time .due-info:nth-of-type(1)');
    const dueTimeElement = listItem.querySelector('.task-due-date-time .due-info:nth-of-type(2)');


    const taskName = taskNameElement ? taskNameElement.textContent.trim() : '';
    const taskDueDateValue = dueDateElement ? dueDateElement.textContent.trim() : '';
    const taskDueTimeValue = dueTimeElement ? dueTimeElement.textContent.trim() : '';
    // console.log('task name ',taskName);
    // console.log('task due date ; ',)
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

        updateTaskData();
    };

    document.getElementById('cancel-edit').onclick = function () {
        document.body.removeChild(editDialog);
    };
}


function updateTaskData() {
    console.log('entering to updateTaskData function');
    const editedTaskName = document.getElementById('edit-task-name').value;
    const editedTaskDueDate = document.getElementById('edit-task-due-date').value;
    const editedTaskDueTime = document.getElementById('edit-task-due-time').value;
    const editedTaskPriority = document.getElementById('edit-task-priority').value;

    updateTaskToLocalStorage(editedTaskName, editedTaskDueDate, editedTaskDueTime, editedTaskPriority);
    // Remove the edit dialog
    const editDialog = document.querySelector('.edit-dialog');
    if (editDialog) {
        document.body.removeChild(editDialog);
    }
    // Call showAllTasks to update the UI
    showAllTasks();
}

function updateTaskToLocalStorage(editedTaskName, editedTaskDueDate, editedTaskDueTime, editedTaskPriority) {
    const editedTaskUUID = document.getElementById('edit-task-uuid').value;

    // Retrieve existing tasks from localStorage
    console.log('in updateTaskToLocalStorage', editedTaskName, editedTaskDueDate, editedTaskDueTime, editedTaskPriority);
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Update the task
    tasks = tasks.map(task => {
        if (task.taskName === editedTaskName) {
            return {
                ...task,
                taskName: editedTaskName,
                dueDate: editedTaskDueDate,
                dueTime: editedTaskDueTime,
                priority: editedTaskPriority
            };
        }
        return task;
    });

    console.log('saving updated task to localStorage');
    // Save updated tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
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


function initializeEditDeleteEvents() {
    const taskItems = listContainer.querySelectorAll('.task-item');
    taskItems.forEach(listItem => {
        attachEditDeleteEvents(listItem);
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
function deleteTask(listItem) {
    console.log('Deleting task item:', listItem);

    const taskNameElement = listItem.querySelector('.task-name');
    const dueDateElement = listItem.querySelector('.task-due-date-time .due-info:nth-child(1)');
    const dueTimeElement = listItem.querySelector('.task-due-date-time .due-info:nth-child(2)');

    console.log('Task Name Element:', taskNameElement);
    console.log('Due Date Element:', dueDateElement);
    console.log('Due Time Element:', dueTimeElement);

    const taskName = taskNameElement ? taskNameElement.textContent.trim() : '';
    const dueDate = dueDateElement ? dueDateElement.textContent.trim() : '';
    const dueTime = dueTimeElement ? dueTimeElement.textContent.trim() : '';

    console.log('Task Name:', taskName);
    console.log('Due Date:', dueDate);
    console.log('Due Time:', dueTime);

    deleteTaskFromLocalStorage(taskName, dueDate, dueTime);

    showAllTasks();
}

function deleteTaskFromLocalStorage(taskName, dueDate, dueTime) {
    console.log(' task : deleting from localStorage');
    console.log('Task Name:', taskName);
    console.log('Due Date:', dueDate);
    console.log('Due Time:', dueTime);

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        console.log('Checking Task:', task.taskName.trim().toLowerCase(), task.dueDate.trim(), task.dueTime.trim());
    });

    tasks = tasks.filter(task => {
        return !(
            task.taskName.trim().toLowerCase() === taskName.trim().toLowerCase() &&
            task.dueDate.trim() === dueDate.trim() &&
            task.dueTime.trim() === dueTime.trim()
        );
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));

    showAllTasks();
}

function markAsComplete(listItem) {
    const taskName = listItem.querySelector('.task-name').innerText;
    const dueDate = listItem.querySelector('.due-info:nth-child(1)').innerText;
    const dueTime = listItem.querySelector('.due-info:nth-child(2)').innerText;
    const priorityClass = listItem.className.split(' ').find(className => className.startsWith('task-priority-'));
    const priority = priorityClass ? priorityClass.replace('task-priority-', '') : 'low';

    // Save the completed task and remove it from pending tasks
    saveCompletedTaskToLocalStorage(taskName, dueDate, dueTime);
    deleteTaskFromLocalStorage(taskName, dueDate, dueTime);

    // Refresh the UI
    showAllTasks();
}

function saveCompletedTaskToLocalStorage(taskName, dueDate, dueTime) {
    // Retrieve the existing completed tasks from localStorage
    let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
    let pendingTasks = JSON.parse(localStorage.getItem('tasks'));

    // Find the matching task
    const task = pendingTasks.find(task =>
        task.taskName === taskName && task.dueDate === dueDate && task.dueTime === dueTime
    );

    if (task) {
        // Add the task to the completedTasks array
        completedTasks.push(task);

        // Save the updated completedTasks array back to localStorage
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    }
}


function initializeSortable() {
    new Sortable(listContainer, {
        animation: 150,
        onEnd: function () {

        }
    });

    new Sortable(document.getElementById('completed-list-container'), {
        animation: 150,
        onEnd: function () {

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
