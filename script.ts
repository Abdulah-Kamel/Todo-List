let mainContainer: HTMLDivElement;
let subContainer: HTMLDivElement;
let Heading: HTMLHeadingElement;
let todoForm: HTMLFormElement;
let todoInput: HTMLInputElement;
let todoSubmit: HTMLButtonElement;
let todoList: HTMLUListElement;

type todoId = number;

interface todo {
    readonly id: todoId;
    content: string;
    completed: boolean;
}

let todoItems: todo[] = JSON.parse(localStorage.getItem("todoItems") || "[]");

(function displayUi(): void {
    mainContainer = document.createElement("div");
    mainContainer.classList.add("container");
    subContainer = document.createElement("div");
    subContainer.classList.add("sub-container");
    Heading = document.createElement("h1");
    Heading.textContent = "Todo List App";
    todoForm = document.createElement("form");
    todoForm.id = "todo-form";
    todoInput = document.createElement("input");
    todoInput.id = "todo-input";
    todoInput.placeholder = "Add a new todo";
    todoInput.required = true;
    todoInput.type = "text";
    todoSubmit = document.createElement("button");
    todoSubmit.type = "submit";
    todoSubmit.textContent = "Add";
    todoForm.appendChild(todoInput);
    todoForm.appendChild(todoSubmit);
    subContainer.appendChild(Heading);
    subContainer.appendChild(todoForm);
    mainContainer.appendChild(subContainer);
    document.body.appendChild(mainContainer);

    if (todoItems.length > 0) {
        todoItems.forEach(displayTodo);
    }

    todoSubmit.addEventListener("click", addTodo)
})();

function displayTodoList(): void {
    if (todoList === undefined) {
        todoList = document.createElement("ul");
        todoList.id = "todo-list";
        mainContainer.appendChild(todoList);
    }
}


function addTodo(e: Event): void {
    e.preventDefault();
    let todoValue: string = todoInput.value.trim();
    if (todoValue !== "") {
        let todo: todo = {
            id: todoItems.length + 1,
            content: todoValue,
            completed: false,
        };
        todoItems.push(todo);
        localStorage.setItem("todoItems", JSON.stringify(todoItems));
        displayTodo(todo);
        todoInput.value = "";
    } else {
        alert("Please Enter Valid Value!");
    }
}


function displayTodo(todo: todo): void {
    displayTodoList()
    const li: HTMLLIElement = document.createElement("li");
    li.classList.add("todo-item");

    const label: HTMLLabelElement = document.createElement("label");
    label.classList.add("form-control");

    const checkbox: HTMLInputElement = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "completed";

    const span: HTMLSpanElement = document.createElement("span");
    span.textContent = todo.content;

    label.appendChild(checkbox);
    label.appendChild(span);
    li.appendChild(label);

    const actions: HTMLDivElement = document.createElement("div");
    actions.classList.add("actions");

    const editBtn: HTMLButtonElement = document.createElement("button");
    editBtn.classList.add("edit-button");
    editBtn.textContent = "Edit";

    const deleteBtn: HTMLButtonElement = document.createElement("button");
    deleteBtn.classList.add("delete-button");
    deleteBtn.textContent = "Delete";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);

    todoList.appendChild(li);

// Event Listeners
    checkbox.addEventListener("click", () => {
        todo.completed = checkbox.checked
        span.style.textDecoration = todo.completed ? "line-through" : "none";

    });
    editBtn.addEventListener("click", () => {
        span.style.display = "none";
        editBtn.style.display = "none";
        checkbox.style.display = "none";
        deleteBtn.style.display = "none";

        const editInput: HTMLInputElement = document.createElement("input");
        editInput.value = todo.content;
        editInput.type = "text";
        editInput.classList.add("edit-input");
        editInput.style.width = "100%";

        const updateBtn: HTMLButtonElement = document.createElement("button");
        updateBtn.textContent = "Update";
        updateBtn.classList.add("update-button");

        li.appendChild(editInput);
        li.appendChild(updateBtn);

        updateBtn.addEventListener("click", () => {
            const newContent: string = editInput.value.trim();
            if (newContent !== "") {
                const todoObj: todo | undefined = todoItems.find(
                  (t) => t.id === todo.id
                );
                if (todoObj) todoObj.content = newContent;
                

                span.textContent = newContent;
                span.style.display = "inline";
                editBtn.style.display = "inline";
                checkbox.style.display = "inline";
                deleteBtn.style.display = "inline";
                li.removeChild(editInput);
                li.removeChild(updateBtn);
                localStorage.setItem("todoItems", JSON.stringify(todoItems));
            } else {
                alert("Please Enter Valid Value!");
            }
        });
    });

    deleteBtn.addEventListener("click", (): void => {
        todoItems = todoItems.filter((t: todo) => t.id !== todo.id);
        todoList.removeChild(li);
        localStorage.setItem("todoItems", JSON.stringify(todoItems));
    });

}