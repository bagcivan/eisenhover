function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.classList.add('task');
  taskElement.textContent = task.text;
  taskElement.setAttribute('data-id', task.id);
  taskElement.setAttribute('title', `${task.dateAdded}`);

  taskElement.setAttribute('draggable', 'true');
  taskElement.ondragstart = function (event) {
    event.dataTransfer.setData('text/plain', task.id);
  };

  taskElement.ondblclick = function () {
    editTask(task.id);
  };

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-task');
  deleteButton.textContent = 'x';
  deleteButton.onclick = function () {
    deleteTask(task.id);
  };

  taskElement.appendChild(deleteButton);
  return taskElement;
}

function addTask() {
  const taskInput = document.getElementById('task-input');
  const importance = document.getElementById('importance-selector').value;
  const urgency = document.getElementById('urgency-selector').value;
  const taskId = new Date().getTime();
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString() + ' ' + currentDate.toLocaleTimeString();

  if (taskInput.value.trim() === '') return;

  const task = {
    id: taskId.toString(),
    text: taskInput.value.trim(),
    quadrant: (importance === 'important' ? '1' : '2') + (urgency === 'urgent' ? '1' : '2'),
    dateAdded: dateString,
  };

  const taskElement = createTaskElement(task);
  document.getElementById(`q${task.quadrant}`).appendChild(taskElement);

  taskInput.value = '';

  saveTaskToLocalStorage(task);
}

function deleteTask(taskId) {
  const taskElement = document.querySelector(`[data-id='${taskId}']`);
  taskElement.remove();
  deleteTaskFromLocalStorage(taskId);
}

function updateLocalStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveTaskToLocalStorage(task) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(task);
  updateLocalStorage(tasks);
}

function deleteTaskFromLocalStorage(taskId) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const updatedTasks = tasks.filter((task) => task.id !== taskId);
  updateLocalStorage(updatedTasks);
}

function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    document.getElementById(`q${task.quadrant}`).appendChild(taskElement);
  });
}

function updateTask(taskId, newText) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      task.text = newText;
    }
    return task;
  });
  updateLocalStorage(updatedTasks);
}

function editTask(taskId) {
  const taskElement = document.querySelector(`[data-id='${taskId}']`);
  const taskText = taskElement.childNodes[0];
  const deleteButton = taskElement.querySelector('.delete-task');
  const taskInput = document.createElement('input');
  taskInput.type = 'text';
  taskInput.value = taskText.textContent.trim();
  taskInput.classList.add('task-edit-input');

  let enterPressed = false;

  taskInput.addEventListener('blur', () => {
    if (!enterPressed) {
      updateTask(taskId, taskInput.value);
      taskText.textContent = taskInput.value;
      taskElement.replaceChild(taskText, taskInput);
      taskElement.appendChild(deleteButton);
    }
  });

  taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      enterPressed = true;
      updateTask(taskId, taskInput.value);
      taskText.textContent = taskInput.value;
      taskElement.replaceChild(taskText, taskInput);
      taskElement.appendChild(deleteButton);
    }
  });

  taskElement.removeChild(deleteButton);
  taskElement.replaceChild(taskInput, taskText);
  taskInput.focus();
}

function updateTaskQuadrant(taskId, newQuadrantId) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      task.quadrant = newQuadrantId.slice(1);
    }
    return task;
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function allowDrop(event) {
  event.preventDefault();
}

function onDragEnter(event) {
  event.target.classList.add('drag-over');
}

function onDragLeave(event) {
  event.target.classList.remove('drag-over');
}

function onDrop(event, quadrantId) {
  event.preventDefault();
  event.target.classList.remove('drag-over');

  const taskId = event.dataTransfer.getData('text/plain');
  const taskElement = document.querySelector(`[data-id='${taskId}']`);

  document.getElementById(quadrantId).appendChild(taskElement);

  updateTaskQuadrant(taskId, quadrantId);
}

function filterTasks(searchTerm) {
  const tasks = document.querySelectorAll('.task');
  tasks.forEach((task) => {
    if (task.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
      task.style.display = 'flex';
    } else {
      task.style.display = 'none';
    }
  });
}

function changeLanguage(language) {
  const keys = Object.keys(translations[language]);
  keys.forEach((key) => {
    const element = document.getElementById(key);
    if (element) {
      element.textContent = translations[language][key];
    }
  });
  const searchInput = document.getElementById("search-input");
  searchInput.placeholder = translations[language]["search_tasks"];
}

function toggleDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
}


function initializePreferences() {
  const storedLanguage = localStorage.getItem('language');
  if (storedLanguage) {
    languageSelector.value = storedLanguage;
    changeLanguage(storedLanguage);
  } else {
    changeLanguage('tr');
  }

  const storedDarkMode = localStorage.getItem('dark-mode');
  if (storedDarkMode) {
    darkModeToggle.checked = JSON.parse(storedDarkMode);
    toggleDarkMode(darkModeToggle.checked);
  }
}

function handleLanguageChange() {
  const selectedLanguage = languageSelector.value;
  localStorage.setItem('language', selectedLanguage);
  changeLanguage(selectedLanguage);
}

function handleDarkModeChange() {
  const darkModeEnabled = darkModeToggle.checked;
  localStorage.setItem('dark-mode', JSON.stringify(darkModeEnabled));
  toggleDarkMode(darkModeEnabled);
}

const languageSelector = document.getElementById('language-selector');
const darkModeToggle = document.getElementById('dark-mode-toggle');

languageSelector.addEventListener('change', handleLanguageChange);
darkModeToggle.addEventListener('change', handleDarkModeChange);

function init() {
  loadTasksFromLocalStorage();
  initializePreferences();

  const quadrants = document.querySelectorAll('.quadrant');
  quadrants.forEach((quadrant) => {
    quadrant.ondragover = allowDrop;
    quadrant.ondragenter = onDragEnter;
    quadrant.ondragleave = onDragLeave;
    quadrant.ondrop = function (event) {
      onDrop(event, quadrant.id);
    };
  });

  const taskForm = document.getElementById('task-form');
  taskForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addTask();
  });

  const mainElement = document.querySelector('main');
  mainElement.ondragover = allowDrop;
  mainElement.ondragenter = onDragEnter;
  mainElement.ondragleave = onDragLeave;
  mainElement.ondrop = function (event) {
    const quadrantId = event.target.closest('.quadrant')?.id;
    if (quadrantId) {
      onDrop(event, quadrantId);
    }
  };

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (event) => {
    filterTasks(event.target.value);
  });

  const darkModeToggle = document.getElementById('dark-mode-toggle');
  darkModeToggle.addEventListener('change', (event) => {
    document.body.classList.toggle('dark-mode', event.target.checked);
  });

}

init();

