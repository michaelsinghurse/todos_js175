// todos.js

const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const TodoList = require("./lib/todolist");

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

const compareByTitle = (todoListA, todoListB) => {
  let titleA = todoListA.title.toLowerCase();
  let titleB = todoListB.title.toLowerCase();

  if (titleA < titleB) {
    return -1;
  } else if (titleA > titleB) {
    return 1;
  } else {
    return 0;
  }
};

const sortTodoLists = lists => {
  let undone = lists.filter(todoList => !todoList.isDone());
  let done   = lists.filter(todoList => todoList.isDone());
  undone.sort(compareByTitle);
  done.sort(compareByTitle);
  return [].concat(undone, done);
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

app.post("/lists", (req, res) => {
  let title = req.body.todoListTitle.trim();
  if (title.length === 0) {
    req.flash("error", "A title was not provided.");
    res.render("new-list", {
      flash: req.flash(),
    });
  } else if (title.length > 100) {
    req.flash("error", "The title cannot exceed 100 characters.");
    res.render("new-list", {
      flash: req.flash(),
      todoListTitle: title,
    });
  } else if (todoLists.some(list => list.title === title)) {
    req.flash("error", "Sorry. That title is already taken.");
    res.render("new-list", {
      flash: req.flash(),
      todoListTitle: title,
    });
  } else {
    todoLists.push(new TodoList(title));
    req.flash("success", "The todo list has been created.");
    res.redirect("/lists");
  }
});

app.listen(PORT, () => {
  console.log(`Todos is listening on port ${PORT} of ${HOST}...`);
});


