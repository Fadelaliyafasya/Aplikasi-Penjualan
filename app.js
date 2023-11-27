const express = require("express");
const app = express();
// const session = require("express-session");
// const cookieParser = require("cookie-parser");
// const { body, validationResult, check } = require("express-validator");
const expressLayouts = require("express-ejs-layouts");
const host = "localhost";
const port = 3001;

// static files
app.use(express.static("public"));
app.use(expressLayouts);
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/js", express.static(__dirname + "/public/js"));
app.use("/img", express.static(__dirname + "/public/img"));

// set views
app.set("view engine", "ejs");
app.set("views", "./views");

// ---------------------- Dashboard Area ---------------
// default routes dasboard
app.get("/", (req, res) => {
  res.render("index", {
    title: "VirtuVorgue",
    layout: "layout/core-index",
  });
});

// user dashboard area
app.get("/user", (req, res) => {
  res.render("dasboard-user-area", {
    title: "VirtuVorgue",
    layout: "layout/core-index",
  });
});
// ---------------------- End Dashboard Area ---------------

// ---------------------- Users / employees ---------------
// data-admin
app.get("/data-admin", (req, res) => {
  res.render("data-admin", {
    title: "VirtuVorgue - Data Admin",
    layout: "layout/core-index",
  });
});

// data-user
app.get("/data-user", (req, res) => {
  res.render("data-user", {
    title: "VirtuVorgue - Data User",
    layout: "layout/core-index",
  });
});
// ---------------------- End Users / employees ---------------

// ---------------------- Products -----------------------------
app.get("/products", (req, res) => {
  res.render("products", {
    title: "VirtuVorgue - Products",
    layout: "layout/core-index",
  });
});
// ---------------------- End Products -----------------------------

// ---------------------- Register & login -------------------------------
app.get("/register", (req, res) => {
  res.render("register", {
    title: "VirtuVorgue - Register",
    layout: "layout/register-page",
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "VirtuVorgue - Login",
    layout: "layout/login-page",
  });
});
// ---------------------- End Register & login -----------------------------

// ---------------------- Products -----------------------------
app.get("/error", (req, res) => {
  res.render("error404", {
    title: "VirtuVorgue - Error",
    layout: "layout/core-index",
  });
});
// ---------------------- End Products -----------------------------

// ---------------------- Server -----------------------------
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
