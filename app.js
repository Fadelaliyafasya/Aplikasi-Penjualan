const express = require("express");
const multer = require("multer"); // uploading image
const jwt = require("jsonwebtoken");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { body, validationResult, check } = require("express-validator");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
const {
  fetchData,
  addDataAdmin,
  deleteDataAdmin,
  duplicateIdCheck,
  duplicateName,
  searchAdmin,
  emailDuplicateCheck,
  updateAdmin,
  duplicatePassword,
} = require("./models/data_admins");

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
} = require("./models/data_customers");

const {
  fetchDataProducts,
  duplicateIdProductsCheck,
  addDataProducts,
  duplicateProductsName,
  deleteDataProducts,
  totalProducts,
} = require("./models/data_products");

const host = "localhost";
const port = 3001;

// static files
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(flash()); // mengaktifkan fitur flash
app.use("/css", express.static(__dirname + "/public/assets/css"));
app.use("/js", express.static(__dirname + "/public/assets/js"));
app.use("/img", express.static(__dirname + "/publica/assets/img"));

app.use(express.json()); // req.body
app.use(express.urlencoded({ extended: true })); //menggunakan middleware express.urlencoded().

// // multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/assets/img"); //  folder penyimpanan untuk gambar
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
//     );
//   },
// });

// const fileFilter = function (req, file, cb) {
//   if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPEG and PNG files are allowed!"), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
//   fileFilter: fileFilter,
// });

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

// ==================================== Dashboard Admin Area ====================================
// default routes dasboard
app.get("/dashboard", async (req, res) => {
  try {
    const productName = req.query.product_name || null;
    const productsCount = await totalProducts(productName);

    const customerName = req.query.productName || null;
    const customerCount = await totalCustomer(customerName);

    res.render("index", {
      title: "VirtuVorgue",
      layout: "layout/core-index",
      productsCount,
      customerCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// ------------------------ Error ------------------------------------------
app.get("/error", (req, res) => {
  res.render("error404", {
    title: "VirtuVorgue - Error",
    layout: "layout/error-page",
  });
});
// ==================================== End Error ====================================

// ========================= Transaction ====================================
app.get("/cart", (req, res) => {
  res.render("cart", {
    title: "VirtuVorgue - Cart",
    layout: "layout/core-index",
  });
});

// ------------------------ End Transcation ------------------------------------------

// ================ MIDDLEWARE ADMIN ========================

app.get("/login/admin", (req, res) => {
  res.render("layout/login-page-admin", {
    title: "VirtuVorgue - Login",
    layout: "layout/login-page-admin",
  });
});

// middleware untuk registrasi admin
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
            res.redirect("/register");
            return;
          }

          req.flash(
            "successMessage",
            "Data added successfully and you can login now"
          );
        } else {
          throw new Error("Failed to add admin");
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

// data-admin
app.get("/data-admin", async (req, res) => {
  const admins = await fetchData();

  res.render("admin/data-admin", {
    title: "VirtuVorgue - Data Admin",
    layout: "layout/core-index",
    admins,
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

// Tangani pengiriman formulir untuk menambahkan admin
app.post(
  "/data-admin/add",
  [
    body("id_admin").custom(async (value) => {
      const duplicate = await duplicateIdCheck(value);

      if (duplicate) {
        throw new Error("ID already registered");
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
        await addDataAdmin(
          // Ekstrak data dari tubuh permintaan
          // req.body.id_admin,
          req.body.username,
          req.body.nama,
          req.body.email,
          req.body.mobile_phone,
          req.body.passwords
        );
        req.flash("msg", "Data added successfully");

        // Redirect ke halaman data-admin untuk melihat data yang diperbarui
        res.redirect("/data-admin");
      } catch (err) {
        console.error(err.msg);
        req.flash("msg", "An error occurred while adding data");
        res.status(500);
      }
    }
  }
);

// detail data-admin
app.get("/data-admin/detail-admin/:id_admin", async (req, res) => {
  try {
    const adminId = req.params.id_admin;
    const admins = await fetchData();
    const admin = admins.find((data_admin) => data_admin.id_admin === adminId); // Tambahkan pemanggilan fetchData dengan parameter id_customer

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

// ================ END ADMIN ========================

// ================ MIDDLEWARE CUSTOMER ========================

// data-customer
app.get("/data-customer", async (req, res) => {
  const customers = await fetchDataCustomers();
  res.render("customers/data-customer", {
    title: "VirtuVorgue - Data Customer",
    layout: "layout/core-index",
    customers,
    msg: req.flash("msg"),
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
app.get("/data-customer/detail-customer/:id_customer", async (req, res) => {
  try {
    const customerId = req.params.id_customer;
    const customers = await fetchDataCustomers();
    const customer = customers.find(
      (data_customer) => data_customer.id_customer === customerId
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
    body("id_customer").custom(async (value, { req }) => {
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
app.get("/products/PC", (req, res) => {
  res.render("products/products-pc", {
    title: "VirtuVorgue - Products",
    layout: "layout/core-index",
  });
});

// Mobile phone product list
app.get("/products/mobile-phone", (req, res) => {
  res.render("products/products-mobile-phone", {
    title: "VirtuVorgue - Products",
    layout: "layout/core-index",
  });
});

// Sport product list
app.get("/products/sports", (req, res) => {
  res.render("products/products-sports", {
    title: "VirtuVorgue - Products",
    layout: "layout/core-index",
  });
});

app.get("/products/PC/add", (req, res) => {
  res.render("products/add-product-pc", {
    title: "VirtuVorgue - Products",
    layout: "layout/core-index",
  });
});

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.filename + "_" + Date.now()) + "_" + file.originalname;
  },
});

const upload = multer({
  storage: storage,
}).single("image");

app.post(
  "/products/PC/add",
  upload,
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
      // Tangani kesalahan validasi...
    } else {
      try {
        await addDataProducts(
          req.body.product_name,
          req.body.description,
          req.body.price,
          req.body.stock_quantity,
          req.body.category,
          req.file.filename
        );

        req.flash("msg", "Data added successfully");
        res.redirect("/items");
      } catch (err) {
        console.error(err);
        req.flash("msg", "An error occurred while adding data");
        res.status(500);
      }
    }
  }
);

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
    msg: req.flash("msg"),
  });
});

app.post(
  "/items/add",
  [
    // body("product_id").custom(async (value) => {
    //   const duplicate = await duplicateIdProductsCheck(value);

    //   if (duplicate) {
    //     throw new Error("ID already registered");
    //   }
    //   return true;
    // }),
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
      // Tangani kesalahan validasi...
    } else {
      try {
        await addDataProducts(
          req.body.product_name,
          req.body.description,
          req.body.price,
          req.body.stock_quantity,
          req.body.category
        );

        req.flash("msg", "Data added successfully");
        res.redirect("/items");
      } catch (err) {
        console.error(err);
        req.flash("msg", "An error occurred while adding data");
        res.status(500);
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
    ); // Tambahkan pemanggilan fetchData dengan parameter product_name

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

// ==================================== Register & login ====================================
app.get("/register", (req, res) => {
  res.render("layout/register-page", {
    title: "VirtuVorgue - Register",
    layout: "layout/register-page",
  });
});

app.post("/register", (req, res) => {});

app.get("/login", (req, res) => {
  res.render("layout/login-page", {
    title: "VirtuVorgue - Login",
    layout: "layout/login-page",
  });
});

// ==================================== End Register & login ====================================

// ==================================== Products ====================================
app.get("/error", (req, res) => {
  res.render("error404", {
    title: "VirtuVorgue - Error",
    layout: "layout/core-index",
  });
});
// ==================================== End Products ====================================

// ==================================== Server ====================================
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
