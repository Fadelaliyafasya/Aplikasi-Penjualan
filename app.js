const express = require("express");
const uploader = require("multer"); // uploading image
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const moment = require("moment");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { body, validationResult, check } = require("express-validator");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
// const {
//   addDataAdmin,
//   deleteDataAdmin,
//   duplicateIdCheck,
//   duplicateName,
//   searchAdmin,
//   emailDuplicateCheck,
//   updateAdmin,
//   duplicatePassword,
// } = require("./models/data_admins");

const {
  fetchDataCustomers,
  addDataCustomer,
  deleteDataCustomer,
  duplicateIdCustomerCheck,
  searchCustomer,
  emailDuplicateCustomerCheck,
  updateCustomer,
  duplicateCustomerName,
  duplicatePasswordCustomer,
  duplicateUsernameCustomer,
  totalCustomer,
  fetchCustomer,
} = require("./models/data_customers");

const {
  fetchDataProducts,
  duplicateIdProductsCheck,
  addDataProducts,
  duplicateProductsName,
  deleteDataProducts,
  totalProducts,
} = require("./models/data_products");

const {
  totalUser,
  addDataUser,
  fetchDataUser,
  duplicateIdUserCheck,
  emailDuplicateUserCheck,
} = require("./models/data_user");

const host = "localhost";
const port = 3001;
const now = moment().format("DD MMMM YYYY, HH:mm:ss");

// static files
app.use(expressLayouts);
app.use(express.static("public"));
app.use(flash()); // mengaktifkan fitur flash
app.use("/css", express.static(__dirname + "/public/assets/css"));
app.use("/js", express.static(__dirname + "/public/assets/js"));
app.use("/img", express.static(__dirname + "/public/assets/img"));
app.use("/uploads", express.static(__dirname + "/public/assets/uploads"));

app.use(express.json()); // req.body
app.use(express.urlencoded({ extended: true })); //menggunakan middleware express.urlencoded().

// config flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// set views
app.set("view engine", "ejs");
app.set("views", "./views");

// ====================================Dashboard customer Area ====================================
// default routes dasboard
app.get("/", (req, res) => {
  res.render("dashboard-customer/dashboard", {
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
// ==================================== End Dashboard Area ====================================

// =================================== LOGIN AND REGISTER ===================================

app.get("/login", (req, res) => {
  res.render("layout/login-page", {
    title: "VirtuVorgue - Login",
    layout: "layout/login-page",
  });
});
// authenticateToken,
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await fetchCustomer(username, password);

    console.log("username:", username);
    console.log("password:", password);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    } else {
      const payload = { username: user.username, password: user.password };

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
      localStorage.setItem(accessToken);
      // Mengatur token dalam header Bearer
      res.json({ accessToken: `Bearer ${accessToken}` });
      // return { accessToken };
      // untuk expired access token
      // {
      //   expiresIn: "1h",
      // }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (token == null) return res.sendStatus(401);
//   console.log("Received Token:", token);
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) {
//       return res.sendStatus(403);
//     } else {
//       req.body.user = user;
//     }

//     next();
//   });
// }

app.get("/register", (req, res) => {
  res.render("layout/register-page", {
    title: "VirtuVorgue - Register",
    layout: "layout/register-page",
  });
});

// middleware untuk registrasi
app.post(
  "/register",
  [
    body("nama").custom(async (value) => {
      const duplicate = await duplicateCustomerName(value);

      if (duplicate) {
        throw new Error("Name already registered");
      }
      return true;
    }),
    body("email").custom(async (value) => {
      const emailDuplicate = await emailDuplicateCustomerCheck(value);
      if (emailDuplicate) {
        throw new Error("Email has been registered");
      }
      return true;
    }),

    body("password").custom(async (value) => {
      const duplicate = await duplicatePasswordCustomer(value);
      if (duplicate) {
        throw new Error("Password has been registered");
      }
      return true;
    }),
    body("username").custom(async (value) => {
      const duplicateUser = await duplicateUsernameCustomer(value);
      if (duplicateUser) {
        throw new Error("User has been registered");
      }
      return true;
    }),
    check("email", "Invalid email").isEmail(),
    check("mobile_phone", "mobile phone number invalid").isMobilePhone("id-ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("layout/register-page", {
        title: "VirtuVorgue - Register Admin",
        layout: "layout/register-page.ejs",
        errors: errors.array(),
      });
    } else {
      try {
        console.log("Data yang dikirim: ", req.body);

        // Gunakan fungsi addDataAdmin dari model basis data
        const addedAdmin = await addDataCustomer(
          req.body.username,
          req.body.nama,
          req.body.email,
          req.body.mobile_phone,
          req.body.password
        );

        if (addedAdmin) {
          // Validasi panjang password
          if (req.body.password.length < 6) {
            req.flash(
              "passwordLengthError",
              "Password must be at least 6 characters"
            );
            res.redirect("/login");
            return;
          }

          req.flash(
            "successMessage",
            "Data added successfully and you can login now"
          );
        } else {
          throw new Error("Failed to Register");
        }
      } catch (err) {
        console.error(err.message);
        req.flash("msg", err.message);
        res.status(500).redirect("/register");
        return;
      }
      res.redirect("/login");
    }
  }
);

// ================================== END LOGIN AND REGISTER =================================

// ==================================== Dashboard Admin Area ====================================
// default routes dasboard admin
app.get("/dashboard", async (req, res) => {
  try {
    const productName = req.query.product_name || null;
    const productsCount = await totalProducts(productName);

    const customerName = req.query.name || null;
    const userCount = await totalUser(customerName);

    res.render("index", {
      title: "VirtuVorgue",
      layout: "layout/core-index",
      productsCount,
      userCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// ========================= Transaction ====================================================
app.get("/cart", (req, res) => {
  res.render("cart", {
    title: "VirtuVorgue - Cart",
    layout: "layout/core-index",
  });
});

// ========================= END Transaction ====================================================

// ================ MIDDLEWARE ADMIN ========================

// data-admin
app.get("/data-admin", async (req, res) => {
  const dataUser = await fetchDataUser();
  const userAdmin = dataUser.filter(
    (user) => user.role === 1 || user.role === 2
  );
  res.render("admin/data-admin", {
    title: "VirtuVorgue - Data Admin",
    layout: "layout/core-index",
    userAdmin,
    msg: req.flash("msg"),
  });
});

// add data-admin
app.get("/data-admin/add", (req, res) => {
  res.render("admin/add-admin", {
    title: "VirtuVorgue - Add Admin",
    layout: "layout/core-index",
  });
});

// Tangani pengiriman formulir untuk menambahkan admin oleh super admin
app.post(
  "/data-admin/add",
  [
    body("user_id").custom(async (value) => {
      const duplicate = await duplicateIdUserCheck(value);

      if (duplicate) {
        throw new Error("ID already registered");
      }
      return true;
    }),
    body("email").custom(async (value) => {
      const emailDuplicate = await emailDuplicateUserCheck(value);
      if (emailDuplicate) {
        throw new Error("Email has been registered");
      }
      return true;
    }),
    check("email", "Invalid email").isEmail(),
    check("mobile_phone", "mobile phone number invalid").isMobilePhone("id-ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("admin/add-admin", {
        title: "VirtuVorgue - Add Admin",
        layout: "layout/core-index.ejs",
        errors: errors.array(),
      });
    } else {
      try {
        console.log("Data yang dikirim: ", req.body);

        // Gunakan fungsi addDataAdmin dari model basis data
        await addDataUser(
          req.body.username,
          req.body.name,
          req.body.role,
          req.body.email,
          req.body.mobile_phone,
          req.body.password
        );
        req.flash("msg", "Data added successfully");

        // Redirect ke halaman data-admin untuk melihat data yang diperbarui
        res.redirect("/data-admin");
      } catch (err) {
        console.error(err.message);
        req.flash("msg", "An error occurred while adding data");
        res.status(500).redirect("/data-admin");
      }
    }
  }
);

// detail data-admin
app.get("/data-admin/detail-admin/:user_id", async (req, res) => {
  try {
    const adminId = req.params.user_id;
    const admins = await fetchDataUser();
    const admin = admins.find((data_admin) => data_admin.user_id == adminId); // Tambahkan pemanggilan fetchDataUser dengan parameter id_customer
    res.render("admin/detail-admin", {
      title: "VirtuVorgue - Detail Admin",
      layout: "layout/core-index.ejs",
      admin,
    });
  } catch (err) {
    console.log(err.msg);
  }
});

// update data-admin
app.get("/data-admin/update-admin/:id_admin", async (req, res) => {
  try {
    const admins = await searchAdmin(req.params.id_admin);
    res.render("admin/update-admin", {
      title: "VirtuVorgue - Update Admin",
      layout: "layout/core-index",
      admins,
    });
  } catch (err) {
    console.error(err.msg);
    res.status(500);
  }
});

app.post(
  "/data-admin/update",
  [
    body("id_admin").custom(async (value, { req }) => {
      const duplicate = await duplicateName(value);
      if (value !== req.body.oldName && duplicate) {
        throw new Error("Name has been registered");
      }
      return true;
    }),
    body("email").custom(async (value) => {
      const emailDuplicate = await emailDuplicateCheck(value);
      if (emailDuplicate) {
        throw new Error("Email has been registered");
      }
      return true;
    }),
    check("email", "Invalid email").isEmail(),
    check("mobile_phone", "Something wrong with phone number").isMobilePhone(
      "id-ID"
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("admin/update-admin", {
        title: "VirtuVorgue - Update Admin",
        layout: "layout/core-index",
        errors: errors.array(),
        admins: req.body,
      });
    } else {
      try {
        await updateAdmin(req.body);
        req.flash("msg", "Data updated successfully");
        res.redirect("/data-admin");
      } catch (err) {
        console.error(err.msg);
        res.status(500);
      }
    }
  }
);

// delete data-admin / by ID
app.get("/data-admin/delete-admin/:id_admin", async (req, res) => {
  try {
    const deletedAdmin = await deleteDataAdmin(req.params.id_admin);

    if (!deletedAdmin) {
      req.flash("msg", "Data not found or has been deleted");
    } else {
      req.flash("msg", "Data deleted successfully");
    }

    res.redirect("/data-admin");
  } catch (err) {
    console.error(err.msg);
    req.flash("msg", "An error occurred while deleting data.");
    res.redirect("/data-admin");
  }
});

// ================ END ADMIN =====================================================

// ================ MIDDLEWARE CUSTOMER ========================
// data-customer
app.get("/data-customer", async (req, res) => {
  const customers = await fetchDataUser();
  const cust = customers.filter((c) => c.role === 3);
  res.render("customers/data-customer", {
    title: "VirtuVorgue - Data Customer",
    layout: "layout/core-index",
    cust,
    msg: req.flash("msg "),
  });
});

// add data-admin
app.get("/data-customer/add", (req, res) => {
  res.render("customers/add-customer", {
    title: "VirtuVorgue - Add Customer",
    layout: "layout/core-index",
  });
});

// Tangani pengiriman formulir untuk menambahkan customer
app.post(
  "/data-customer/add",
  [
    body("id_customer").custom(async (value) => {
      const duplicate = await duplicateIdCustomerCheck(value);

      if (duplicate) {
        throw new Error("ID already registered");
      }
      return true;
    }),
    body("email").custom(async (value) => {
      const emailDuplicate = await emailDuplicateCustomerCheck(value);
      if (emailDuplicate) {
        throw new Error("Email has been registered");
      }
      return true;
    }),
    check("email", "Invalid email").isEmail(),
    check("mobile_phone", "mobile phone number invalid").isMobilePhone("id-ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("customers/add-customer", {
        title: "VirtuVorgue - Add Customer",
        layout: "layout/core-index.ejs",
        errors: errors.array(),
      });
    } else {
      try {
        console.log("Data yang dikirim: ", req.body);

        // Gunakan fungsi addDataAdmin dari model basis data
        await addDataCustomer(
          // Ekstrak data dari tubuh permintaan
          req.body.id_customer,
          req.body.username,
          req.body.nama,
          req.body.email,
          req.body.mobile_phone
        );
        req.flash("msg", "Data added successfully");

        // Redirect ke halaman data-admin untuk melihat data yang diperbarui
        res.redirect("/data-customer");
      } catch (err) {
        console.error(err.msg);
        req.flash("msg", "An error occurred while adding data");
        res.status(500);
      }
    }
  }
);

// detail data-customer
app.get("/data-customer/detail-customer/:user_id", async (req, res) => {
  try {
    const customerId = req.params.user_id;
    const customers = await fetchDataUser();
    const customer = customers.find(
      (data_customer) => data_customer.user_id == customerId
    ); // Tambahkan pemanggilan fetchDataCustomer dengan parameter id_customer

    res.render("customers/detail-customer", {
      title: "VirtuVorgue - Detail Customer",
      layout: "layout/core-index.ejs",
      customer,
    });
  } catch (err) {
    console.log(err.msg);
  }
});

// update data-customer
app.get("/data-customer/update-customer/:id_customer", async (req, res) => {
  try {
    const customers = await searchCustomer(req.params.id_customer);
    res.render("customers/update-customer", {
      title: "VirtuVorgue - Update Customer",
      layout: "layout/core-index",
      customers,
    });
  } catch (err) {
    console.error(err.msg);
    res.status(500);
  }
});

app.post(
  "/data-customer/update",
  [
    body("nama").custom(async (value, { req }) => {
      const duplicate = await duplicateCustomerName(value);
      if (value !== req.body.oldName && duplicate) {
        throw new Error("Name has been registered");
      }
      return true;
    }),
    body("email").custom(async (value) => {
      const emailDuplicate = await emailDuplicateCustomerCheck(value);
      if (emailDuplicate) {
        throw new Error("Email has been registered");
      }
      return true;
    }),
    check("email", "Invalid email").isEmail(),
    check("mobile_phone", "Something wrong with phone number").isMobilePhone(
      "id-ID"
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("customers/update-customer", {
        title: "VirtuVorgue - Update Customer",
        layout: "layout/core-index",
        errors: errors.array(),
        customers: req.body,
      });
    } else {
      try {
        await updateCustomer(req.body);
        req.flash("msg", "Data updated successfully");
        res.redirect("/data-customer");
      } catch (err) {
        console.error(err.msg);
        res.status(500);
      }
    }
  }
);

// delete data-admin / by ID
app.get("/data-customer/delete-customer/:id_customer", async (req, res) => {
  try {
    const deletedCustomer = await deleteDataCustomer(req.params.id_customer);

    if (!deletedCustomer) {
      req.flash("msg", "Data not found or has been deleted");
    } else {
      req.flash("msg", "Data deleted successfully");
    }

    res.redirect("/data-customer");
  } catch (err) {
    console.error(err.msg);
    req.flash("msg", "An error occurred while deleting data.");
    res.redirect("/data-customer");
  }
});

// ================ END CUSTOMERS ========================

// ==================================== Products =======================================================
// Pc Product list
app.get("/products", async (req, res) => {
  const products = await fetchDataProducts(req.query.product_name);
  res.render("products/products", {
    title: "VirtuVorgue - Products",
    layout: "layout/core-index",
    products: products,
  });
});

app.get("/products/PC/add", (req, res) => {
  res.render("products/add-product-pc", {
    title: "VirtuVorgue - Products",
    layout: "layout/core-index",
  });
});

app.get("/categories", (req, res) => {
  res.render("products/categories", {
    title: "VirtuVorgue - Categories",
    layout: "layout/core-index",
  });
});

// middlware untuk inventory item
app.get("/items", async (req, res) => {
  const products = await fetchDataProducts();
  res.render("inventory/items", {
    title: "VirtuVorgue - Items",
    layout: "layout/core-index",
    msg: req.flash("msg"),
    products,
  });
});

// middleware add items
app.get("/items/add", async (req, res) => {
  res.render("inventory/add-items", {
    title: "VirtuVorgue - Add Items",
    layout: "layout/core-index",
    msg: req.flash("msg, "),
  });
});

// multer
const storage = uploader.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/assets/img/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});

const upload = uploader({
  storage: storage,
});

app.post(
  "/items/add",
  upload.single("image"),
  [
    body("category").notEmpty().withMessage("Category is required"),
    body("product_name").custom(async (value) => {
      const nameDuplicate = await duplicateProductsName(value);
      if (nameDuplicate) {
        throw new Error("Product has been registered");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Handle validation errors
    } else {
      try {
        if (!req.file) {
          req.body.image = "default.png";
        } else {
          if (!/^image/.test(req.file.mimetype)) {
            req.flash("msg", "File harus berupa gambar");
            return res.redirect("/items");
          }
          req.body.image = req.file.filename;
        }
        const category = req.body.category || " ";
        await addDataProducts(
          req.body.product_name,
          req.body.description,
          req.body.price,
          req.body.stock_quantity,
          req.body.image,
          category
        );
        req.flash("msg", "Data added successfully");
        res.redirect("/items");
      } catch (err) {
        console.error(err);
        req.flash("msg", "An error occurred while adding data");
        return res.status(500).send("<h1>Internal Server Error</h1>");
      }
    }
  }
);

// middleware untuk detail items
app.get("/items/detail-products/:product_name", async (req, res) => {
  try {
    const productName = req.params.product_name;
    const findProduct = await fetchDataProducts();
    const products = findProduct.find(
      (products) => products.product_name === productName
    );

    res.render("inventory/detail-items", {
      title: "VirtuVorgue - Detail Product",
      layout: "layout/core-index.ejs",
      products,
    });
  } catch (err) {
    console.log(err.msg);
  }
});

// delete products items
app.get("/items/delete-products/:product_name", async (req, res) => {
  try {
    const deleteProducts = await deleteDataProducts(req.params.product_name);

    if (!deleteProducts) {
      req.flash("msg", "Data not found or has been deleted");
    } else {
      req.flash("msg", "Data deleted successfully");
    }

    res.redirect("/items");
  } catch (err) {
    console.error(err.msg);
    req.flash("msg", "An error occurred while deleting data.");
    res.redirect("/items");
  }
});

// ==================================== End Products ======================================================

// ==================================== ERROR ====================================
app.use("/", (req, res) => {
  res.render("layout/error404", {
    title: "VirtuVorgue - Error",
    layout: "layout/error404",
  });
});
// ==================================== End ERROR ====================================

// ==================================== Server running ====================================
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
// ==================================== End Server Running ====================================
