interface ITodo {
  readonly id: number;
  content: string;
  completed: boolean;
}

class TodoList {
  private container!: HTMLDivElement;
  private subContainer!: HTMLDivElement;
  private heading!: HTMLHeadingElement;
  private form!: TodoForm;
  private list!: TodoListElement;
  private todos: Todo[];

  constructor() {
    this.todos = this.loadTodos();
    this.initializeUI();
  }

  private loadTodos(): Todo[] {
    const savedTodos = JSON.parse(localStorage.getItem("todoItems") || "[]");
    return savedTodos.map(
      (todo: ITodo) => new Todo(todo.id, todo.content, todo.completed)
    );
  }

  private initializeUI(): void {
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

  private addTodo(content: string): void {
    const newTodo = new Todo(this.todos.length + 1, content, false);
    this.todos.push(newTodo);

    if (this.todos.length === 1) {
      this.container.appendChild(this.list.element);
    }

    this.saveTodos();
    this.displayTodo(newTodo);
  }

  private deleteTodo(todo: Todo): void {
    this.todos = this.todos.filter((t) => t.id !== todo.id);
    this.saveTodos();

    if (this.todos.length === 0) {
      this.container.removeChild(this.list.element);
    }
  }

  private createMainContainer(): void {
    this.container = document.createElement("div");
    this.container.classList.add("container");
  }

  private createSubContainer(): void {
    this.subContainer = document.createElement("div");
    this.subContainer.classList.add("sub-container");
  }

  private createHeading(): void {
    this.heading = document.createElement("h1");
    this.heading.textContent = "Todo List App";
  }

  private displayExistingTodos(): void {
    const sortedTodos = [...this.todos].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });
    
    sortedTodos.forEach((todo) => this.displayTodo(todo));
  }

  private displayTodo(todo: Todo): void {
    const todoItem = new TodoItem(
      todo,
      () => this.updateTodo(todo),
      () => this.deleteTodo(todo)
    );
    this.list.addTodoItem(todoItem);
  }

  private updateTodo(todo: Todo): void {
    this.saveTodos();
  }

  private saveTodos(): void {
    localStorage.setItem("todoItems", JSON.stringify(this.todos));
  }
}

class Todo implements ITodo {
  constructor(
    public readonly id: number,
    public content: string,
    public completed: boolean
  ) {}
}

class TodoForm {
  public element!: HTMLFormElement;
  private input!: HTMLInputElement;
  private submit!: HTMLButtonElement;

  constructor(private onSubmit: (content: string) => void) {
    this.createForm();
  }

  private createForm(): void {
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

  private handleSubmit(e: Event): void {
    e.preventDefault();
    const value = this.input.value.trim();
    if (value) {
      this.onSubmit(value);
      this.input.value = "";
    } else {
      alert("Please Enter Valid Value!");
    }
  }
}

class TodoListElement {
  public element: HTMLUListElement;

  constructor() {
    this.element = document.createElement("ul");
    this.element.id = "todo-list";
  }

  public addTodoItem(todoItem: TodoItem): void {
    this.element.appendChild(todoItem.element);
  }

  public removeTodoItem(element: HTMLElement): void {
    this.element.removeChild(element);
  }
}

class TodoItem {
  public element!: HTMLLIElement;

  constructor(
    private todo: Todo,
    private onUpdate: () => void,
    private onDelete: () => void
  ) {
    this.createTodoItem();
  }

  private createTodoItem(): void {
    this.element = document.createElement("li");
    this.element.classList.add("todo-item");

    const label = this.createLabel();
    const actions = this.createActions();

    this.element.appendChild(label);
    this.element.appendChild(actions);
  }

  private createLabel(): HTMLLabelElement {
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
          } else {
              this.enableEditing();
              this.moveToTop();
          }
          
          this.onUpdate();
      });
  
      label.appendChild(checkbox);
      label.appendChild(span);
  
      return label;
  }

  private moveToTop(): void {
      const parent = this.element.parentElement;
      if (parent && parent.firstChild) {
          parent.insertBefore(this.element, parent.firstChild);
      }
  }
  
  private disableEditing(): void {
      const editBtn = this.element.querySelector(".edit-button") as HTMLButtonElement;
      if (editBtn) {
          editBtn.style.display = "none";
      }
  }
  
  private enableEditing(): void {
      const editBtn = this.element.querySelector(".edit-button") as HTMLButtonElement;
      if (editBtn) {
          editBtn.style.display = "";
      }
  }
  
  private moveToEnd(): void {
      const parent = this.element.parentElement;
      if (parent) {
          parent.appendChild(this.element);
      }
  }
  private createActions(): HTMLDivElement {
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
    
    private handleEdit(): void {
        const label = this.element.querySelector("label") as HTMLElement;
        const actions = this.element.querySelector(".actions") as HTMLElement;
        if (!label || !actions) return;
        
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
                if (span) span.textContent = newContent;
                
                label.style.display = "";
                actions.style.display = "";
                this.element.removeChild(editInput);
                this.element.removeChild(updateBtn);
                this.onUpdate();
            } else {
                alert("Please Enter Valid Value!");
            }
        });
    }
    
    private handleDelete(): void {
        this.onDelete();
        this.element.remove();
    }
}


new TodoList();
