// todos.js

const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const TodoList  = require("./lib/todolist");
const Todo = require("./lib/todo");
const { sortTodoLists, sortTodos } = require("./lib/sort")

const app = express();
const HOST = "localhost";
const PORT = 3000;

// static data for initial testing
let todoLists = require("./lib/seed-data");

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.use(session({
  name: "launch-school-todos-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

const loadTodoList = todoListId => {
  return todoLists.find(list => list.id === todoListId);  
};

const loadTodo = (todoListId, todoId) => {
  let todoList = loadTodoList(todoListId);
  if (!todoList) return;

  return todoList.todos.find(todo => todo.id === todoId);
};

app.get("/", (req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (req, res) => {
  res.render("lists", { 
    todoLists: sortTodoLists(todoLists), 
  });
});

app.get("/lists/new", (req, res) => {
  res.render("new-list"); 
});

app.get("/lists/:todoListId", (req, res, next) => {
  let todoListId = req.params.todoListId;
  let todoList = loadTodoList(+todoListId);
  if (!todoList) {
    next(new Error("Not found."));
  } else {
    res.render("list", {
      todoList,
      todos: sortTodos(todoList),
    });
  }
});

app.post("/lists",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The list title is required.")
      .isLength({ max: 100 })
      .withMessage("List title must be between 1 and 100 characters.")
      .custom(title => {
        let duplicate = todoLists.find(list => list.title === title);
        return duplicate === undefined;
      })
      .withMessage("List title must be unique."),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.render("new-list", {
        flash: req.flash(),
        todoListTitle: req.body.todoListTitle,
      });
    } else {
      todoLists.push(new TodoList(req.body.todoListTitle));
      req.flash("success", "The todo list has been created.");
      res.redirect("/lists");
    }
  }
);

app.post("/lists/:todoListId/todos/:todoId/toggle", (req, res, next) => {
  let { todoListId, todoId }  = req.params;
  
  let todo = loadTodo(+todoListId, +todoId);
  if (!todo) {
    next(new Error("Not found"));
  }

  if (todo.isDone()) {
    todo.markUndone();
    req.flash("success", `"${todo.title}" marked incomplete.`);
  } else {
    todo.markDone();
    req.flash("success", `"${todo.title}" marked complete.`);
  }
  
  res.redirect(`/lists/${todoListId}`);
});

app.post("/lists/:todoListId/todos/:todoId/destroy", (req, res, next) => {
  let { todoListId, todoId }  = req.params;
  
  let todoList = loadTodoList(+todoListId);
  if (!todoList) {
    next(new Error("Not found"));
  }

  let todo = loadTodo(+todoListId, +todoId);
  if (!todo) {
    next(new Error("Not found"));
  }
  
  let title = todo.title;
  todoList.removeAt(todoList.findIndexOf(todo));
  
  req.flash("success", `"${title}" deleted.`);  
  res.redirect(`/lists/${todoListId}`);
});

app.post("/lists/:todoListId/complete_all", (req, res, next) => {
  let todoListId = req.params.todoListId;

  let todoList = loadTodoList(+todoListId);
  if (!todoList) {
    next(new Error("Not found"));
  }

  todoList.markAllDone();

  req.flash("success", "All items marked complete.");
  res.redirect(`/lists/${todoListId}`);
});

app.post("/lists/:todoListId/todos",
  [
    body("todoTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The todo title is required.")
      .isLength({ max: 100 })
      .withMessage("Todo title must be between 1 and 100 characters.")
  ],
  (req, res, next) => {
    let todoListId = req.params.todoListId;
    let todoTitle = req.body.todoTitle;
    let todoList = loadTodoList(+todoListId);
    if (!todoList) {
      next(new Error("Not found."));     
    }

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.render("list", {
        flash: req.flash(),
        todoTitle,
        todoList,
        todos: sortTodos(todoList),
      });
    } else {
      todoList.add(new Todo(todoTitle));

      req.flash("success", `"${todoTitle}" added to list.`);
      res.redirect(`/lists/${todoListId}`);
    }
  }
);

app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404).send(err.message);
});

app.listen(PORT, () => {
  console.log(`Todos is listening on port ${PORT} of ${HOST}...`);
});

























