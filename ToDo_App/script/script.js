const inputBox = document.getElementById('input-box');
const taskDuration = document.getElementById('task-duration');
const taskPriority = document.getElementById('task-priority');
const listContainer = document.getElementById('list-container');
const searchBar = document.getElementById('search-bar');
const filterTasks = document.getElementById('filter-tasks');
const darkModeToggle = document.getElementById('dark-mode-toggle');

function addTask() {
    if (inputBox.value === '') {
        alert('You Must Write Something for a Task');
    } else {
        let duration = taskDuration.value;
        let priority = taskPriority.value;

        let listItem = document.createElement('li');
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

        let ellipsis = document.createElement('span');
        ellipsis.classList.add('ellipsis-menu');
        ellipsis.innerHTML = '&#8226;&#8226;&#8226;';

        let dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('dropdown-menu');
        dropdownMenu.innerHTML = `
            <a href="#" class="edit-task">Edit</a>
            <a href="#" class="delete-task">Delete</a>
            <a href="#" class="task-details">Details</a>
            <a href="#" class="markAsComplete">Mark As Complete</a>
        `;

        listItem.innerHTML = `${inputBox.value} (Duration: ${duration} minutes) `;
        listItem.appendChild(ellipsis);
        listItem.appendChild(dropdownMenu);

        listContainer.appendChild(listItem);

        inputBox.value = '';
        taskDuration.value = '';
        taskPriority.value = 'low';

        saveData();

        ellipsis.onclick = function(event) {
            event.stopPropagation();
            let menu = listItem.querySelector('.dropdown-menu');
            let isVisible = menu.style.display === 'block';
            document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
            menu.style.display = isVisible ? 'none' : 'block';
        };

        document.addEventListener('click', function(event) {
            if (!event.target.closest('.list-group-item')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
            }
        });

        listItem.querySelector('.edit-task').onclick = function(event) {
            event.preventDefault();
            editTask(listItem);
        };

        listItem.querySelector('.delete-task').onclick = function(event) {
            event.preventDefault();
            deleteTask(listItem);
        };

        let durationInMinutes = parseInt(duration, 10);
        if (!isNaN(durationInMinutes) && durationInMinutes > 0) {
            scheduleNotification(inputBox.value, durationInMinutes);
        }

        listItem.querySelector('.markAsComplete').onclick = function(event) {
            event.preventDefault();
            markAsComplete(listItem);
        };
    }
}

function scheduleNotification(task, duration) {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        setTimeout(() => {
            new Notification(`Reminder: ${task}`);
        }, duration * 60 * 1000);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                setTimeout(() => {
                    new Notification(`Reminder: ${task}`);
                }, duration * 60 * 1000);
            }
        });
    }
}

function saveData() {
    localStorage.setItem('data', listContainer.innerHTML);
}

function showTask() {
    listContainer.innerHTML = localStorage.getItem('data');
    initializeSortable();
    initializeEllipsisMenu();
}

function editTask(listItem) {
    const taskText = listItem.firstChild.textContent.trim();
    const taskDetails = taskText.match(/(.*) \(Duration: (\d+) minutes\)/);
    const taskName = taskDetails[1];
    const taskDuration = taskDetails[2];

    inputBox.value = taskName;
    taskDuration.value = taskDuration;

    listItem.remove();
    saveData();
}

function deleteTask(listItem) {
    listItem.remove();
    saveData();
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
        ellipsis.onclick = function (event) {
            event.stopPropagation();
            const listItem = ellipsis.closest('.list-group-item');
            const menu = listItem.querySelector('.dropdown-menu');
            const isVisible = menu.style.display === 'block';
            document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
            menu.style.display = isVisible ? 'none' : 'block';
        };
    });

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.list-group-item')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
        }
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

darkModeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
});

showTask();
initializeSortable();