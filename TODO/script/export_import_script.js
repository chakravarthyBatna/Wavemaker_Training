const exportTasksButton = document.getElementById('export-tasks');
const importTasksInput = document.getElementById('import-tasks');

importTasksInput.addEventListener('change', importTasks);

exportTasksButton.addEventListener('click', () => {
    console.log('Export button clicked');
    exportTasks();
});

function exportTasks() {
    console.log('Export function called');

    const tasks = [];
    document.querySelectorAll('.task-item').forEach(taskItem => {
        const task = {
            name: taskItem.querySelector('.task-name').textContent.trim(),
            dueDate: taskItem.querySelector('.task-due-date-time .due-info').textContent.trim() || '',
            dueTime: taskItem.querySelector('.task-due-date-time .due-info:last-child').textContent.trim() || '',
            priority: taskItem.classList.contains('task-priority-high') ? 'high' :
                      taskItem.classList.contains('task-priority-medium') ? 'medium' : 'low',
            completed: taskItem.classList.contains('completed')
        };
        tasks.push(task);
    });

    console.log('Tasks to export:', tasks);

    const dataStr = JSON.stringify(tasks, null, 4);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'tasks.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);  // Append link to body to ensure it can be clicked
    linkElement.click();
    document.body.removeChild(linkElement);  // Remove link after clicking to clean up
}


function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        try {
            const tasks = JSON.parse(content);
            const listContainer = document.getElementById('list-container');
            const completedListContainer = document.getElementById('completed-list-container');

            listContainer.innerHTML = '';
            completedListContainer.innerHTML = '';

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
                    <a href="#" id="task-detail" class="task-details">Details</a>
                    <a href="#" class="markAsComplete">Mark As Complete</a>
                `;

                listItem.innerHTML = `
                    <div class="task-name">${task.name}</div>
                    <div class="task-due-date-time">
                        <span class="dot">•</span>
                        <span class="due-info">${task.dueDate}</span>
                        <span class="dot">•</span>
                        <span class="due-info">${task.dueTime}</span>
                    </div>
                `;

                listItem.appendChild(ellipsis);
                listItem.appendChild(dropdownMenu);

                if (task.completed) {
                    listItem.classList.add('completed');
                    const moveToIncompleteOption = document.createElement('a');
                    moveToIncompleteOption.href = '#';
                    moveToIncompleteOption.textContent = 'Move to Incomplete';
                    moveToIncompleteOption.classList.add('moveToIncomplete');
                    dropdownMenu.appendChild(moveToIncompleteOption);
                    attachMoveToIncompleteEvent(moveToIncompleteOption, listItem);

                    completedListContainer.appendChild(listItem);
                } else {
                    listContainer.appendChild(listItem);
                }

                attachEllipsisEvent(ellipsis, listItem);
                attachEditDeleteEvents(listItem);
                initializeDetailsEvent();
            });

            saveData();
            showTask();
        } catch (err) {
            alert('Failed to parse JSON file');
            console.error(err);
        }
    };
    reader.readAsText(file);
}
