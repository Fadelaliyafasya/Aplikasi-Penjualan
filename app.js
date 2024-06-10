const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const host = "localhost";
const port = 3001;

const authController = require("./controllers/authController.js");
const errorController = require("./controllers/errorController.js");
const dashboardController = require("./controllers/dashboardController.js");
const adminController = require("./controllers/adminController.js");
const customerController = require("./controllers/customerController.js");
const cartController = require("./controllers/cartController.js");
const transactionController = require("./controllers/transactionController.js");
const productController = require("./controllers/productsController.js");

// static files
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.json()); // req.body
app.use(express.urlencoded({ extended: true }));

// config flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: null },
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/css", express.static(__dirname + "/public/assets/css"));
app.use("/js", express.static(__dirname + "/public/assets/js"));
app.use("/img", express.static(__dirname + "/public/assets/img"));
app.use("/uploads", express.static(__dirname + "/public/assets/uploads"));

app.use(flash());
// set views
app.set("view engine", "ejs");
app.enable("strict routing");
app.set("views", "./views");

// Dashboard
app.get("/", dashboardController.dashboard);

// Routes Login
app.get("/login", authController.loginPage);
app.post("/login", authController.login);
app.get("/logout", authController.logout);
app.get("/register", authController.registerPage);
app.post("/register", authController.register);

// Routes admin management
app.get("/data-admin", adminController.showAdminData);
app.get("/data-admin/add", adminController.showAddAdminForm);
app.post("/data-admin/add", adminController.addNewAdmin);
app.get("/data-admin/detail-admin/:user_id", adminController.showAdminDetail);
app.get(
  "/data-admin/update-admin/:user_id",
  adminController.showUpdateAdminForm
);
app.post("/data-admin/update", adminController.updateAdminData);
app.get("/data-admin/delete-admin/:user_id", adminController.deleteAdmin);

// // Customer Data
app.get("/data-customer", customerController.showCustomerData);
app.get(
  "/data-customer/detail-customer/:user_id",
  customerController.showCustomerDetail
);
app.get(
  "/data-customer/delete-customer/:user_id",
  customerController.deleteCustomer
);

// Cart Data
app.get("/cart", cartController.showCart);
app.get("/add-cart/:product_id", cartController.addToCart);
app.get("/sum-cart/:product_id", cartController.sumCartItem);
app.get("/sub-cart/:product_id", cartController.subtractCartItem);

// Transaction Data
app.get("/checkout", transactionController.checkout);
app.get("/transaction", transactionController.showTransaction);

// Products
// Product routes
app.get("/products", productController.getProductList);
app.get("/items", productController.getInventoryItems);
app.get("/items/add", productController.getAddItemPage);
app.post("/items/add", productController.addItem);
app.get(
  "/items/detail-products/:product_name",
  productController.getItemDetails
);
app.get(
  "/items/delete-products/:product_name",
  productController.deleteProduct
);

// Eror
app.use(errorController.error404);

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
// ==================================== End Server Running ====================================
