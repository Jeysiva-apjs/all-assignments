const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const port = 3000;

const app = express();
app.use(bodyParser.json());

ADMINS = [];
USERS = [];
COURSES = [];
let IdCounter = 0;
const secret = "jey$iva";

const authenticate = (req, res, next) => {
  let isAuth = req.headers.authorization;
  if (isAuth) {
    const token = isAuth.split(" ")[1];
    jwt.verify(token, secret, (err, data) => {
      if (err) {
        return res.json({ error: "Failed authentication" });
      }
      req.username = data;
      next();
    });
  } else {
    res.send("error");
  }
};

app.post("/admin/signup", (req, res) => {
  const admin = req.body;

  const isAdmin = ADMINS.find((a) => a.username === admin.username);

  if (isAdmin) {
    return res.status(400).json({ error: "Admin already exists" });
  }
  ADMINS.push(admin);
  const token = jwt.sign(admin.username, secret);

  res.send({ message: "Admin created successfully", token: token });
});

app.listen(port, () => {
  console.log(`Listening on the port ${port}`);
});

app.post("/admin/login", (req, res) => {
  const admin = req.headers;

  const isAdmin = ADMINS.find(
    (a) => a.username === admin.username && a.password === admin.password
  );

  const token = jwt.sign(admin.username, secret);

  if (isAdmin) {
    res.json({ message: "Logged in successfully", token: token });
  } else {
    res.json({ error: "error" });
  }
});

app.post("/admin/courses", authenticate, (req, res) => {
  let course = req.body;
  course.id = ++IdCounter;
  COURSES.push(course);
  res.json({ message: "Course created successfully", courseId: IdCounter });
});

app.put("/admin/courses/:courseId", authenticate, (req, res) => {
  const updateId = parseInt(req.params.courseId);
  const cou = COURSES.find((c) => c.id === updateId);
  Object.assign(cou, req.body);
  res.json({ message: "Course updated successfully" });
});

app.get("/admin/courses", authenticate, (req, res) => {
  res.json({ courses: COURSES });
});
