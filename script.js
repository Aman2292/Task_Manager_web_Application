(function() {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const tabButtons = document.querySelectorAll('.tab-button');
    const addImageButton = document.getElementById('add-image-button');
    const imageInput = document.getElementById('image-input');

    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskClick);
    tabButtons.forEach(button => button.addEventListener('click', filterTasks));
    addImageButton.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', addImageTask);

    loadTasks();

    function addTask(e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const task = {
            text: taskText,
            status: 'not-yet-started',
            important: false,
            notes: '',
            links: []
        };

        addTaskToDOM(task);
        saveTaskToLocalStorage(task);
        taskInput.value = '';
    }

    function addImageTask() {
        const file = imageInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const task = {
                text: 'Image Task',
                status: 'not-yet-started',
                important: true,
                notes: '',
                links: [],
                image: e.target.result
            };

            addTaskToDOM(task);
            saveTaskToLocalStorage(task);
        };
        reader.readAsDataURL(file);
    }

    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.className = 'task';
        li.dataset.status = task.status;
        li.dataset.important = task.important;
        li.dataset.notes = task.notes ? 'true' : 'false';
        li.dataset.links = task.links.length > 0 ? 'true' : 'false';
        li.innerHTML = `
            <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''}>
            <span class="${task.status === 'completed' ? 'completed' : ''}">${task.text}</span>
            ${task.image ? `<img src="${task.image}" alt="Task Image" style="width: 50px; height: 50px;">` : ''}
            <div class="status-buttons">
                <button class="status-button in-progress ${task.status === 'in-progress' ? 'active' : ''}" data-status="in-progress">In Progress</button>
                <button class="status-button in-review ${task.status === 'in-review' ? 'active' : ''}" data-status="in-review">In Review</button>
                <button class="status-button not-yet-started ${task.status === 'not-yet-started' ? 'active' : ''}" data-status="not-yet-started">Not Yet Started</button>
                <button class="delete-button"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    
        taskList.appendChild(li);
    }    

    function handleTaskClick(e) {
        if (e.target.tagName === 'BUTTON') {
            const button = e.target;
            const taskItem = button.closest('.task');

            if (button.classList.contains('delete-button')) {
                deleteTask(taskItem);
            } else if (button.classList.contains('status-button')) {
                updateTaskStatus(taskItem, button.dataset.status);
            }
        } else if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            toggleTaskCompletion(e.target.closest('.task'));
        }
    }

    function deleteTask(taskItem) {
        taskItem.remove();
        const taskText = taskItem.querySelector('span').textContent;
        deleteTaskFromLocalStorage(taskText);
    }

    function updateTaskStatus(taskItem, status) {
        const buttons = taskItem.querySelectorAll('.status-button');
        buttons.forEach(button => button.classList.remove('active'));

        const taskText = taskItem.querySelector('span').textContent;
        const button = taskItem.querySelector(`button[data-status="${status}"]`);
        if (button) {
            button.classList.add('active');
        }

        taskItem.dataset.status = status;
        updateTaskStatusInLocalStorage(taskText, status);
    }

    function toggleTaskCompletion(taskItem) {
        const taskText = taskItem.querySelector('span').textContent;
        const completed = taskItem.querySelector('input[type="checkbox"]').checked;
        taskItem.querySelector('span').classList.toggle('completed', completed);
        updateTaskCompletionInLocalStorage(taskText, completed);
    }

    function filterTasks(e) {
        const filter = e.target.dataset.filter;
        tabButtons.forEach(button => button.classList.remove('active'));
        e.target.classList.add('active');

        const tasks = taskList.querySelectorAll('.task');
        tasks.forEach(task => {
            switch (filter) {
                case 'all':
                    task.style.display = '';
                    break;
                case 'important':
                    task.style.display = task.dataset.important === 'true' ? '' : 'none';
                    break;
                case 'notes':
                    task.style.display = task.dataset.notes === 'true' ? '' : 'none';
                    break;
                case 'links':
                    task.style.display = task.dataset.links === 'true' ? '' : 'none';
                    break;
            }
        });
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTaskToDOM(task));
    }

    function saveTaskToLocalStorage(task) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function deleteTaskFromLocalStorage(taskText) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.text !== taskText);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateTaskStatusInLocalStorage(taskText, status) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(task => task.text === taskText);
        if (task) {
            task.status = status;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    function updateTaskCompletionInLocalStorage(taskText, completed) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(task => task.text === taskText);
        if (task) {
            task.status = completed ? 'completed' : 'not-yet-started';
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }
})();
