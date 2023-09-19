class TodoCollection {
  constructor(storageModel) {
    this.todos = storageModel.getTodos();
    this.idCounter = 1;
  }

  addTodo(todoText) {
    const todo = {
      id: this.idCounter++,
      text: todoText,
      completed: false,
    };
    this.todos.push(todo);
    return todo;
  }

  toggleTodoStatus(id) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  updateTodoText(id, newText) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo) {
      todo.text = newText;
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }

  getAllTodos() {
    return this.todos;
  }
}

class TodoStorage {
  constructor() {
    this.storageKey = 'todos';
  }

  saveTodos(todos) {
    localStorage.setItem(this.storageKey, JSON.stringify(todos));
  }

  getTodos() {
    const storedTodos = localStorage.getItem(this.storageKey);
    return storedTodos ? JSON.parse(storedTodos) : [];
  }
}

class TodoDOM {
  constructor(dataModel, storageModel) {
    this.dataModel = dataModel;
    this.storageModel = storageModel;
    this.todoList = document.getElementById('todo-list');
    this.form = document.getElementById('add-todo-item-form');
    this.input = document.getElementById('todo-item-text');
    this.addButton = document.getElementById('add-todo-item-button');

    this.form.addEventListener('submit', this.handleAddTodo.bind(this));
    this.todoList.addEventListener('click', this.handleTodoClick.bind(this));

    this.renderTodos();
  }

  renderTodos() {
    const todos = this.dataModel.getAllTodos();
    this.todoList.textContent = '';

    todos.forEach((todo) => {
      const li = document.createElement('li');
      li.textContent = todo.text;

      const updateButton = document.createElement('button');
      updateButton.textContent = 'Update';
      updateButton.dataset.id = todo.id;

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.dataset.id = todo.id;

      updateButton.addEventListener('click', () => {
        const newText = prompt('Edit todo:', todo.text);
        if (newText !== null) {
          todo.text = newText;
          this.dataModel.updateTodoText(todo.id, newText);
          this.renderTodos();
          this.storageModel.saveTodos(this.dataModel.getAllTodos());
        }
      });

      li.appendChild(updateButton);
      li.appendChild(deleteButton);

      if (todo.completed) {
        li.classList.add('completed');
      }

      this.todoList.appendChild(li);
    });
  }

  handleAddTodo(event) {
    event.preventDefault();
    const todoText = this.input.value.trim();
    if (todoText) {
      const newTodo = this.dataModel.addTodo(todoText);
      this.input.value = '';
      this.renderTodos();
      this.storageModel.saveTodos(this.dataModel.getAllTodos());
    }
  }

  handleTodoClick(event) {
    if (event.target.tagName === 'BUTTON') {
      const id = parseInt(event.target.dataset.id);
      if (event.target.textContent === 'Delete') {
        this.dataModel.deleteTodo(id);
      } else if (event.target.textContent === 'Update') {
        this.dataModel.toggleTodoStatus(id);
      }
      this.renderTodos();
      this.storageModel.saveTodos(this.dataModel.getAllTodos());
    }
  }
}

// Initialize the application
const storageModel = new TodoStorage();
const dataModel = new TodoCollection(storageModel);
const todoApp = new TodoDOM(dataModel, storageModel);
