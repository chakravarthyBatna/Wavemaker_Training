const exportTasksButton = document.getElementById('export-tasks');
const importTasksInput = document.getElementById('import-tasks');

exportTasksButton.addEventListener('click', exportTasks);
importTasksInput.addEventListener('change', importTasks);

function exportTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(taskItem => {
        const task = {
            content: taskItem.childNodes[0].textContent.trim(),
            dueDate: taskItem.innerHTML.match(/Due: (\d{4}-\d{2}-\d{2})/)[1],
            dueTime: taskItem.innerHTML.match(/Due: \d{4}-\d{2}-\d{2} (\d{2}:\d{2})/)[1],
            priority: taskItem.classList.contains('task-priority-high') ? 'high' :
                      taskItem.classList.contains('task-priority-medium') ? 'medium' : 'low',
            completed: taskItem.classList.contains('completed')
        };
        tasks.push(task);
    });

    const dataStr = JSON.stringify(tasks, null, 4);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'tasks.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        try {
            const tasks = JSON.parse(content);
            listContainer.innerHTML = '';

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

                if (task.completed) {
                    listItem.classList.add('completed');
                    const completedListContainer = document.getElementById('completed-list-container');
                    completedListContainer.appendChild(listItem);
                } else {
                    listContainer.appendChild(listItem);
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

                listItem.innerHTML = `${task.content} (Due: ${task.dueDate} ${task.dueTime}) `;
                listItem.appendChild(ellipsis);
                listItem.appendChild(dropdownMenu);
                attachEllipsisEvent(ellipsis, listItem);
                attachEditDeleteEvents(listItem);
            });

            saveData();
            showTask();
        } catch (err) {
            alert('Failed to parse JSON file');
        }
    };
    reader.readAsText(file);
}
