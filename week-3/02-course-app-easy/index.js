const express = require("express");
const body_parser = require("body-parser");
const app = express();

app.use(express.json());
app.use(body_parser.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let idCounter = 0;

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (admin) => admin.username === username && admin.password === password
  );
  if (admin) {
    next();
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }
};

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(
    (user) => user.username === username && user.password === password
  );
  if (user) {
    req.user = user; // add user object to the request
    next();
  } else {
    res.status(403).json({ message: "User authentication failed" });
  }
};

// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const { username, password } = req.body;
  const admin = ADMINS.find((admin) => admin.username == username);
  if (admin) {
    return res.status(403).json({ Error: "Admin already present" });
  }
  ADMINS.push({
    username: username,
    password: password,
  });
  console.log(ADMINS);
  res.json({ message: "Admin created successfully" });
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  // logic to log in admin
  res.json({ message: "Logged in successfully" });
});

app.post("/admin/courses", adminAuthentication, (req, res) => {
  // logic to create a course
  const course = req.body;
  if (!course.title) {
    return res.json(411).json({ error: "please give title" });
  }

  course.id = ++idCounter;
  COURSES.push(course);

  res.json({ message: "Course created successfully", courseId: idCounter });
});

app.put("/admin/courses/:courseId", adminAuthentication, (req, res) => {
  // logic to edit a course
  const updateId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === updateId);

  if (course) {
    Object.assign(course, req.body);
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(400).json({ error: "The requested course is not present" });
  }
});

app.get("/admin/courses", adminAuthentication, (req, res) => {
  // logic to get all courses
  res.json({ courses: COURSES });
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
  //USERS.push(...req.body, purchasedCourses: [])
  USERS.push({
    username: req.body.username,
    password: req.body.password,
    purchasedCoursesIds: [],
  });
  res.json({ message: "User created successfully" });
});

app.post("/users/login", userAuthentication, (req, res) => {
  // logic to log in user
  res.json({ message: "Logged in successfully" });
});

app.get("/users/courses", userAuthentication, (req, res) => {
  // logic to list all courses
  res.json({ courses: COURSES.filter((c) => c.published) });
});

app.post("/users/courses/:courseId", userAuthentication, (req, res) => {
  // logic to purchase a course
  const purchasedId = parseInt(req.params.courseId);

  const isCoursePresent = COURSES.some((course) => course.id === purchasedId);

  if (isCoursePresent) {
    req.user.purchasedCoursesIds.push(purchasedId);
    res.json({ message: "Course purchased successfully" });
  } else {
    res.status(400).json({ error: "Please enter correct details" });
  }
});

app.get("/users/purchasedCourses", userAuthentication, (req, res) => {
  // logic to view purchased courses
  const purchasedCourses = COURSES.filter((course) =>
    req.user.purchasedCoursesIds.includes(course.id)
  );

  res.json({ purchasedCourses: purchasedCourses });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
