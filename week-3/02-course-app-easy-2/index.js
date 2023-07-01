const express = require("express");
const jwt = require("jsonwebtoken");
const body_parser = require("body-parser");
const app = express();

app.use(express.json());
app.use(body_parser.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let idCounter = 0;

const secretKey = "1@6!sdf";
const generateJwt = (user) => {
  const payload = { user };
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403);
      }

      req.user = user;
      next();
    });
  }
  res.sendStatus(401);
};

// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const isAdminExists = ADMINS.find((admin) => admin.username == username);
  if (isAdminExists) {
    return res.status(403).json({ Error: "Admin already present" });
  }
  ADMINS.push(admin);
  const token = generateJwt(admin);
  res.json({ message: "Admin created successfully", token });
});

app.post("/admin/login", (req, res) => {
  // logic to log in admin
  const { username, password } = req.headers;
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );

  if (admin) {
    const token = generateJwt(admin);
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }
});

app.post("/admin/courses", authenticateJwt, (req, res) => {
  // logic to create a course
  const course = req.body;
  if (!course.title) {
    return res.json(411).json({ error: "please give title" });
  }

  course.id = ++idCounter;
  COURSES.push(course);

  res.json({ message: "Course created successfully", courseId: idCounter });
});

app.put("/admin/courses/:courseId", authenticateJwt, (req, res) => {
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

app.get("/admin/courses", authenticateJwt, (req, res) => {
  // logic to get all courses
  res.json({ courses: COURSES });
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
  const user = req.body;
  const existingUser = USERS.find((u) => u.username === user.username);
  if (existingUser) {
    res.status(403).json({ message: "User already exists" });
  } else {
    USERS.push(user);
    const token = generateJwt(user);
    res.json({ message: "User created successfully", token });
  }
});

app.post("/users/login", (req, res) => {
  // logic to log in user
  const { username, password } = req.headers;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    const token = generateJwt(user);
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "User authentication failed", token });
  }
});

app.get("/users/courses", authenticateJwt, (req, res) => {
  // logic to list all courses
  res.json({ courses: COURSES.filter((c) => c.published) });
});

app.post("/users/courses/:courseId", authenticateJwt, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    const user = USERS.find((u) => u.username === req.user.username);
    if (user) {
      if (!user.purchasedCourses) {
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      res.json({ message: "Course purchased successfully" });
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

app.get("/users/purchasedCourses", authenticateJwt, (req, res) => {
  const user = USERS.find((u) => u.username === req.user.username);
  if (user && user.purchasedCourses) {
    res.json({ purchasedCourses: user.purchasedCourses });
  } else {
    res.status(404).json({ message: "No courses purchased" });
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
