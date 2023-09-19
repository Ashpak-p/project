// Pure Functions 
function addTodo(todos, todoText, idCounter) {
  const newTodo = {
    id: idCounter,
    text: todoText,
  };
  return [...todos, newTodo];
}

function updateTodoText(todos, id, newText) {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, text: newText } : todo
  );
}

function deleteTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

// Side Effects
function saveTodosToStorage(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function getTodosFromStorage() {
  const storedTodos = localStorage.getItem('todos');
  return storedTodos ? JSON.parse(storedTodos) : [];
}

// UI Functions
function renderTodos(todos, idCounter) {
  const todoList = document.getElementById('todo-list');
  todoList.textContent = '';

  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.textContent = todo.text;

    const updateButton = document.createElement('button');
    updateButton.textContent = 'Edit';
    updateButton.addEventListener('click', () => {
      const newText = prompt('Edit todo:', todo.text);
      if (newText !== null) {
        todos = updateTodoText(todos, todo.id, newText);
        saveAndRenderTodos(todos, idCounter);
      }
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      todos = deleteTodo(todos, todo.id);
      saveAndRenderTodos(todos, idCounter);
    });

    li.appendChild(updateButton);
    li.appendChild(deleteButton);
    todoList.appendChild(li);
  });
}

function saveAndRenderTodos(todos, idCounter) {
  saveTodosToStorage(todos);
  renderTodos(todos, idCounter);
}

// Initialize the Application
let todos = getTodosFromStorage();
let idCounter = todos.length > 0 ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1;
renderTodos(todos, idCounter);

const form = document.getElementById('add-todo-item-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('todo-item-text');
  const todoText = input.value.trim();
  if (todoText) {
    todos = addTodo(todos, todoText, idCounter);
    idCounter++;
    input.value = '';
    saveAndRenderTodos(todos, idCounter);
  }
});
