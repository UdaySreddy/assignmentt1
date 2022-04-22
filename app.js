let express = require("express");
let sqlite = require("sqlite");
let sqlite3 = require("sqlite3");
let { open } = require("sqlite");
let path = require("path");
let format = require("date-fns/format");
let app = express();
app.use(express.json());

let base = path.join(__dirname, "todoApplication.db");
let db = null;

let initializeDB = async () => {
  try {
    db = await open({
      filename: base,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running....");
    });
  } catch (e) {
    console.log(`error:${e.message}`);
    process.exit(1);
  }
};
initializeDB();

//get api
app.get("/todos/", async (request, response) => {
  const { id, todo, category, priority, status, search_q } = request.query;
  let query1 = "";
  console.log(id, todo, category, priority, status, search_q);
  if (status !== undefined) {
    query1 = `select * from todo where status = "${status}";`;
  } else if (priority !== undefined) {
    query1 = `select * from todo where priority = "${priority}";`;
  } else if (status !== undefined && priority !== undefined) {
    query1 = `select * from todo where priority = "${priority}" and 
        status = "${status}";`;
  } else if (category !== undefined && status !== undefined) {
    query1 = `select * from todo where category = "${category}" and 
        status = "${status}";`;
  } else if (category !== undefined) {
    query1 = `select * from todo where category = "${category}";`;
  } else if (category !== undefined && priority !== undefined) {
    query1 = `select * from todo where category = "${category}" and 
       priority = "${priority}";`;
  } else if (search_q !== undefined) {
    query1 = `select * from todo where todo like  "%${search_q}%";`;
  } else {
    query1 = `select * from todo;`;
  }
  let x = await db.all(query1);
  let result1 = x.map((each) => {
    let x = {};
    x.id = each.id;
    x.todo = each.todo;
    x.priority = each.priority;
    x.status = each.status;
    x.category = each.category;
    x.dueDate = each.due_date;
    return x;
  });
  response.send(result1);
});

//get params

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let query2 = `select * from todo where id = ${todoId};`;
  let x = await db.all(query2);
  let result2 = x.map((each) => {
    let x = {};
    x.id = each.id;
    x.todo = each.todo;
    x.priority = each.priority;
    x.status = each.status;
    x.category = each.category;
    x.dueDate = each.due_date;
    return x;
  });
  response.send(result2[0]);
});

// get due date

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  let fdate = format(new Date(date), "yyyy-MM-dd");

  let query3 = `select * from todo where due_date = "${fdate}";`;
  let x = await db.all(query3);
  let result3 = x.map((each) => {
    let x = {};
    x.id = each.id;
    x.todo = each.todo;
    x.priority = each.priority;
    x.status = each.status;
    x.category = each.category;
    x.dueDate = each.due_date;
    return x;
  });

  response.send(result3);
});

//post todo

app.post("/todos/", async (request, response) => {
  const { id, todo, category, priority, status, dueDate } = request.body;
  let fdate = format(new Date(dueDate), "yyyy-M-dd");
  let query4 = `insert into todo 
  (id, todo, category, priority, status, due_date)
  values (${id},"${todo}","${category}","${priority}","${status}","${fdate}")`;
  let x = await db.run(query4);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { id, todo, category, priority, status, dueDate } = request.body;
  let query5 = "";
  if (status !== undefined) {
    query5 = `update todo set status = "${status}"`;
    await db.run(query5);
    response.send("Status Updated");
  } else if (category !== undefined) {
    query5 = `update todo set category = "${category}"`;
    await db.run(query5);
    response.send("Category Updated");
  } else if (priority !== undefined) {
    query5 = `update todo set priority = "${priority}"`;
    await db.run(query5);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    query5 = `update todo set todo = "${todo}"`;
    await db.run(query5);
    response.send("Todo Updated");
  } else {
    query5 = `update todo set due_date = "${dueDate}"`;
    await db.run(query5);
    response.send("Due Date Updated");
  }
});

//delete todo

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let query6 = `delete from todo where id = ${todoId};`;
  await db.run(query6);
  response.send("Todo Deleted");
});

module.exports = app;
