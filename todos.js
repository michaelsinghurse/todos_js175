// todos.js

const express = require("express");
const morgan = require("morgan");

const app = express();
const HOST = "localhost";
const PORT = 3000;

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));

app.get("/", (req, res) => {
  res.render("lists");
});

app.listen(PORT, () => {
  console.log(`Todos is listening on port ${PORT} of ${HOST}...`);
});


