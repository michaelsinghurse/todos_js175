// sort.js

const compareByTitle = (itemA, itemB) => {
  let titleA = itemA.title.toLowerCase();
  let titleB = itemB.title.toLowerCase();

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

const sortTodos = todoList => {
  let undone = todoList.todos.filter(todo => !todo.isDone());
  let done = todoList.todos.filter(todo => todo.isDone());
  undone.sort(compareByTitle);
  done.sort(compareByTitle);
  return [].concat(undone, done);
};

module.exports = {
  sortTodoLists,
  sortTodos,
};
