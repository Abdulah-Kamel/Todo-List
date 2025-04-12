"use strict";
class TodoList {
    constructor() {
        this.todos = this.loadTodos();
        this.initializeUI();
    }
    loadTodos() {
        const savedTodos = JSON.parse(localStorage.getItem("todoItems") || "[]");
        return savedTodos.map((todo) => new Todo(todo.id, todo.content, todo.completed));
    }
    initializeUI() {
        this.createMainContainer();
        this.createSubContainer();
        this.createHeading();
        this.form = new TodoForm(this.addTodo.bind(this));
        this.list = new TodoListElement();
        this.subContainer.appendChild(this.heading);
        this.subContainer.appendChild(this.form.element);
        this.container.appendChild(this.subContainer);
        if (this.todos.length > 0) {
            this.container.appendChild(this.list.element);
        }
        document.body.appendChild(this.container);
        this.displayExistingTodos();
    }
    addTodo(content) {
        const newTodo = new Todo(this.todos.length + 1, content, false);
        this.todos.push(newTodo);
        if (this.todos.length === 1) {
            this.container.appendChild(this.list.element);
        }
        this.saveTodos();
        this.displayTodo(newTodo);
    }
    deleteTodo(todo) {
        this.todos = this.todos.filter((t) => t.id !== todo.id);
        this.saveTodos();
        if (this.todos.length === 0) {
            this.container.removeChild(this.list.element);
        }
    }
    createMainContainer() {
        this.container = document.createElement("div");
        this.container.classList.add("container");
    }
    createSubContainer() {
        this.subContainer = document.createElement("div");
        this.subContainer.classList.add("sub-container");
    }
    createHeading() {
        this.heading = document.createElement("h1");
        this.heading.textContent = "Todo List App";
    }
    displayExistingTodos() {
        const sortedTodos = [...this.todos].sort((a, b) => {
            if (a.completed === b.completed)
                return 0;
            return a.completed ? 1 : -1;
        });
        sortedTodos.forEach((todo) => this.displayTodo(todo));
    }
    displayTodo(todo) {
        const todoItem = new TodoItem(todo, () => this.updateTodo(todo), () => this.deleteTodo(todo));
        this.list.addTodoItem(todoItem);
    }
    updateTodo(todo) {
        this.saveTodos();
    }
    saveTodos() {
        localStorage.setItem("todoItems", JSON.stringify(this.todos));
    }
}
class Todo {
    constructor(id, content, completed) {
        this.id = id;
        this.content = content;
        this.completed = completed;
    }
}
class TodoForm {
    constructor(onSubmit) {
        this.onSubmit = onSubmit;
        this.createForm();
    }
    createForm() {
        this.element = document.createElement("form");
        this.element.id = "todo-form";
        this.input = document.createElement("input");
        this.input.id = "todo-input";
        this.input.placeholder = "Add a new todo";
        this.input.required = true;
        this.input.type = "text";
        this.submit = document.createElement("button");
        this.submit.type = "submit";
        this.submit.textContent = "Add";
        this.element.appendChild(this.input);
        this.element.appendChild(this.submit);
        this.element.addEventListener("submit", (e) => this.handleSubmit(e));
    }
    handleSubmit(e) {
        e.preventDefault();
        const value = this.input.value.trim();
        if (value) {
            this.onSubmit(value);
            this.input.value = "";
        }
        else {
            alert("Please Enter Valid Value!");
        }
    }
}
class TodoListElement {
    constructor() {
        this.element = document.createElement("ul");
        this.element.id = "todo-list";
    }
    addTodoItem(todoItem) {
        this.element.appendChild(todoItem.element);
    }
    removeTodoItem(element) {
        this.element.removeChild(element);
    }
}
class TodoItem {
    constructor(todo, onUpdate, onDelete) {
        this.todo = todo;
        this.onUpdate = onUpdate;
        this.onDelete = onDelete;
        this.createTodoItem();
    }
    createTodoItem() {
        this.element = document.createElement("li");
        this.element.classList.add("todo-item");
        const label = this.createLabel();
        const actions = this.createActions();
        this.element.appendChild(label);
        this.element.appendChild(actions);
    }
    createLabel() {
        const label = document.createElement("label");
        label.classList.add("form-control");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "completed";
        checkbox.checked = this.todo.completed;
        const span = document.createElement("span");
        span.textContent = this.todo.content;
        if (this.todo.completed) {
            span.style.textDecoration = "line-through";
            this.disableEditing();
        }
        checkbox.addEventListener("click", () => {
            this.todo.completed = checkbox.checked;
            span.style.textDecoration = checkbox.checked ? "line-through" : "none";
            if (checkbox.checked) {
                this.disableEditing();
                this.moveToEnd();
            }
            else {
                this.enableEditing();
                this.moveToTop();
            }
            this.onUpdate();
        });
        label.appendChild(checkbox);
        label.appendChild(span);
        return label;
    }
    moveToTop() {
        const parent = this.element.parentElement;
        if (parent && parent.firstChild) {
            parent.insertBefore(this.element, parent.firstChild);
        }
    }
    disableEditing() {
        const editBtn = this.element.querySelector(".edit-button");
        if (editBtn) {
            editBtn.style.display = "none";
        }
    }
    enableEditing() {
        const editBtn = this.element.querySelector(".edit-button");
        if (editBtn) {
            editBtn.style.display = "";
        }
    }
    moveToEnd() {
        const parent = this.element.parentElement;
        if (parent) {
            parent.appendChild(this.element);
        }
    }
    createActions() {
        const actions = document.createElement("div");
        actions.classList.add("actions");
        const editBtn = document.createElement("button");
        editBtn.classList.add("edit-button");
        editBtn.textContent = "Edit";
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-button");
        deleteBtn.textContent = "Delete";
        editBtn.addEventListener("click", () => this.handleEdit());
        deleteBtn.addEventListener("click", () => this.handleDelete());
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        return actions;
    }
    handleEdit() {
        const label = this.element.querySelector("label");
        const actions = this.element.querySelector(".actions");
        if (!label || !actions)
            return;
        label.style.display = "none";
        actions.style.display = "none";
        const editInput = document.createElement("input");
        editInput.value = this.todo.content;
        editInput.type = "text";
        editInput.classList.add("edit-input");
        editInput.style.width = "100%";
        const updateBtn = document.createElement("button");
        updateBtn.textContent = "Update";
        updateBtn.classList.add("update-button");
        this.element.appendChild(editInput);
        this.element.appendChild(updateBtn);
        updateBtn.addEventListener("click", () => {
            const newContent = editInput.value.trim();
            if (newContent !== "") {
                this.todo.content = newContent;
                const span = label.querySelector("span");
                if (span)
                    span.textContent = newContent;
                label.style.display = "";
                actions.style.display = "";
                this.element.removeChild(editInput);
                this.element.removeChild(updateBtn);
                this.onUpdate();
            }
            else {
                alert("Please Enter Valid Value!");
            }
        });
    }
    handleDelete() {
        this.onDelete();
        this.element.remove();
    }
}
new TodoList();
