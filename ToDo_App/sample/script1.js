const inputBox = document.getElementById('input-box');
const taskDueDate = document.getElementById('task-due-date');
const taskDueTime = document.getElementById('task-due-time');
const taskPriority = document.getElementById('task-priority');
const listContainer = document.getElementById('list-container');
const darkModeToggle = document.getElementById('dark-mode-toggle');

let currentTaskItem = null;
let currentSubTaskItem = null;

function addTask() {
    if (inputBox.value === '') {
        alert('You Must Write Something for a Task');
        return;
    }

    const taskName = inputBox.value.trim();
    const dueDate = taskDueDate.value;
    const dueTime = taskDueTime.value;
    const priority = taskPriority.value;

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

    listItem.innerHTML = `
        ${taskName} (Due: ${dueDate} ${dueTime})
        <button class="btn btn-sm btn-secondary add-subtask-btn">Add Sub-task</button>
        <ul class="subtask-container list-unstyled pl-3"></ul>
    `;

    listContainer.appendChild(listItem);

    inputBox.value = '';
    taskDueDate.value = '';
    taskDueTime.value = '';
    taskPriority.value = 'low';

    attachSubTaskButtonEvents(listItem);

    saveData();
}

function attachSubTaskButtonEvents(taskItem) {
    const addSubTaskBtn = taskItem.querySelector('.add-subtask-btn');
    addSubTaskBtn.onclick = function () {
        currentTaskItem = taskItem;
        $('#addSubTaskModal').modal('show');
    };
}

function saveNewSubTask() {
    const subTaskName = document.getElementById('new-subtask-name').value.trim();
    if (!subTaskName) return;

    const subTaskItem = document.createElement('li');
    subTaskItem.classList.add('sub-task-item', 'list-group-item', 'ml-3');
    subTaskItem.innerHTML = `
        ${subTaskName}
        <button class="edit-subtask btn btn-sm btn-secondary">Edit</button>
        <button class="delete-subtask btn btn-sm btn-danger">Delete</button>
    `;

    currentTaskItem.querySelector('.subtask-container').appendChild(subTaskItem);
    document.getElementById('new-subtask-name').value = '';
    $('#addSubTaskModal').modal('hide');

    attachSubTaskEvents(subTaskItem);
    saveData();
}

function attachSubTaskEvents(subTaskItem) {
    subTaskItem.querySelector('.edit-subtask').onclick = function () {
        currentSubTaskItem = subTaskItem;
        document.getElementById('edit-subtask-name').value = subTaskItem.firstChild.textContent.trim();
        $('#editSubTaskModal').modal('show');
    };

    subTaskItem.querySelector('.delete-subtask').onclick = function () {
        subTaskItem.remove();
        saveData();
    };
}

function saveSubTaskEdit() {
    const newSubTaskName = document.getElementById('edit-subtask-name').value.trim();
    if (newSubTaskName) {
        currentSubTaskItem.firstChild.textContent = `${newSubTaskName} `;
        $('#editSubTaskModal').modal('hide');
        saveData();
    }
}

function saveData() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(taskItem => {
        const taskText = taskItem.firstChild.textContent.trim();
        const taskDetails = taskText.match(/(.*) \(Due: (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})\)/);
        if (!taskDetails) return;

        const taskName = taskDetails[1].trim();
        const dueDate = taskDetails[2].trim();
        const dueTime = taskDetails[3].trim();
        const priority = Array.from(taskItem.classList).find(cls => cls.startsWith('task-priority-')).split('-').pop();

        const subtasks = Array.from(taskItem.querySelectorAll('.sub-task-item')).map(subTaskItem => {
            return {
                name: subTaskItem.firstChild.textContent.trim()
            };
        });

        tasks.push({ taskName, dueDate, dueTime, priority, subtasks });
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadData() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.forEach(task => {
        inputBox.value = task.taskName;
        taskDueDate.value = task.dueDate;
        taskDueTime.value = task.dueTime;
        taskPriority.value = task.priority;
        addTask();

        const taskItem = listContainer.lastChild;
        task.subtasks.forEach(subtask => {
            const subTaskItem = document.createElement('li');
            subTaskItem.classList.add('sub-task-item', 'list-group-item', 'ml-3');
            subTaskItem.innerHTML = `
                ${subtask.name}
                <button class="edit-subtask btn btn-sm btn-secondary">Edit</button>
                <button class="delete-subtask btn btn-sm btn-danger">Delete</button>
            `;
            taskItem.querySelector('.subtask-container').appendChild(subTaskItem);
            attachSubTaskEvents(subTaskItem);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadData();
    darkModeToggle.addEventListener('click', toggleDarkMode);
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

