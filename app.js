const express = require("express");
const uploader = require("multer"); // uploading image
// const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
// require("dotenv").config();
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
  fetchProductsById,
} = require("./models/data_products");

const {
  fetchDataUser,
  totalUser,
  addDataUser,
  searchUserByUsername,
  duplicateIdUserCheck,
  emailDuplicateUserCheck,
  duplicateUserName,
  searchUserByID,
  duplicatePasswordUser,
  duplicateUsernameUser,
  deleteDataUser,
  searchUser,
} = require("./models/data_user");

const {
  addCart,
  searchCart,
  updateCart,
  searchCartByUserId,
  deleteCart,
} = require("./models/cart");

const app = express();
const host = "localhost";
const port = 3001;
const now = moment().format("DD MMMM YYYY, HH:mm:ss");

// static files
app.use(expressLayouts);
app.use(express.static("public"));
// mengaktifkan fitur flash
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
    cookie: { maxAge: null },
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

// set views
app.set("view engine", "ejs");
app.enable("strict routing");
app.set("views", "./views");
app.use(flash());
app.use((req, res, next) => {
  next();
});
// ====================================Dashboard customer Area ====================================
// default routes dasboard
app.get("/", async (req, res) => {
  var log = req.session.authenticated ? "true" : "false";
  var userData = await searchUserByID(req.session.dataUser.id);
  res.render("dashboard-customer/dashboard", {
    title: "VirtuVorgue",
    logged: log,
    message: req.flash("message"),
    layout: "layout/core-index",
    userData,
  });
});

// ==================================== End Dashboard Area ====================================

// ========================= CART ====================================================
app.get("/cart", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 2 || req.session.dataUser.role == 3) {
      var userData = await searchUserByID(req.session.dataUser.id);
      var dataCart = await searchCartByUserId(req.session.dataUser.id);
      res.render("cart", {
        title: "VirtuVorgue - Cart",
        layout: "layout/core-index",
        dataCart,
        userData,
        logged: "true",
        message: req.flash("message"),
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/login");
  }
});

app.get("/add-cart/:product_id", async (req, res) => {
  if (req.session.authenticated) {
    // Mendapatkan data produk dari database berdasarkan product_id
    // const product = await fetchProductsById(req.params.product_id);

    // if (product) {
    // Melakukan pengecekan apakah produk sudah ada di dalam cart
    var cartCheck = await searchCart(
      req.session.dataUser.id,
      req.params.product_id
    );

    if (cartCheck) {
      // Jika produk sudah ada di dalam cart, update jumlahnya
      const data = [
        req.session.dataUser.id,
        req.params.product_id,
        cartCheck.quantity + 1,
      ];
      await updateCart(data);
      req.flash("message", {
        alert: "success",
        message: "Items have been updated in the cart!",
      });
    } else {
      // Jika produk belum ada di dalam cart, tambahkan ke dalam cart dengan jumlah 1
      const data = [req.session.dataUser.id, req.params.product_id, 1];
      await addCart(data);

      req.flash("message", {
        alert: "success",
        message: "Item has been added to cart!",
      });
    }

    res.redirect("/products");
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/login");
  }
});

// controller sum product cart
app.get("/sum-cart/:product_id", async (req, res) => {
  if (req.session.authenticated) {
    var dataProduct = await fetchProductsById(req.params.product_id);
    var cartCheck = await searchCart(
      req.session.dataUser.id,
      req.params.product_id
    );
    var jumlahUpdate = cartCheck.quantity + 1;
    if (jumlahUpdate <= dataProduct.stock_quantity) {
      var data = [req.session.dataUser.id, req.params.product_id, jumlahUpdate];
      await updateCart(data);
      req.flash("message", {
        alert: "success",
        message: "Number of Items Added Successfully!",
      });
    } else {
      req.flash("message", {
        alert: "failed",
        message: "Number of Items Exceeds Maximum!",
      });
    }
    res.redirect("/cart");
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/login");
  }
});

// controller sub product cart
app.get("/sub-cart/:product_id", async (req, res) => {
  if (req.session.authenticated) {
    var cartCheck = await searchCart(
      req.session.dataUser.id,
      req.params.product_id
    );
    var jumlahUpdate = cartCheck.quantity - 1;
    if (jumlahUpdate > 0) {
      var data = [req.session.dataUser.id, req.params.product_id, jumlahUpdate];
      await updateCart(data);
      req.flash("message", {
        alert: "success",
        message: "Number of Items Successfully Reduced!",
      });
    } else {
      var data = [req.session.dataUser.id, req.params.product_id];
      await deleteCart(data);
      req.flash("message", {
        alert: "warning",
        message: "Deleted Item Data!",
      });
    }
    res.redirect("/cart");
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/login");
  }
});

// ========================= END CART ====================================================

// =================================== LOGIN AND REGISTER ===================================
async function passwordVerification(password, passwordHash) {
  const result = await bcrypt.compare(password, passwordHash);
  return result;
}

app.get("/login", async (req, res) => {
  console.log("Terotentikasi:", req.session.authenticated);
  if (req.session.authenticated) {
    console.log("Peran Pengguna:", req.session.dataUser.role);
    req.flash("message", { alert: "warning", message: "You Are Signed In!" });
    if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
      res.redirect("/dashboard");
    } else if (req.session.dataUser.role == 3) {
      res.redirect("/");
    }
  } else {
    res.render("layout/login-page", {
      title: "VirtuVorgue - Login",
      message: req.flash("message"),
      layout: "layout/login-page",
    });
  }
});

app.post(
  "/login",
  [check("password", "Password Harus Diisi").notEmpty().trim()],

  async (req, res) => {
    var dataUser = await searchUserByUsername(req.body.username);

    if (dataUser) {
      if (await passwordVerification(req.body.password, dataUser.password)) {
        req.session.authenticated = true;
        req.session.dataUser = { id: dataUser.user_id, role: dataUser.role };

        if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
          // Set req.session.authenticated berdasarkan role (gunakan peran langsung)
          req.session.authenticated = req.session.dataUser.role;
          res.redirect("/dashboard");
        } else if (req.session.dataUser.role == 3) {
          // Set req.session.authenticated berdasarkan role (gunakan peran langsung)
          req.session.authenticated = req.session.dataUser.role;
          res.redirect("/");
        }
      } else {
        req.flash("message", {
          alert: "failed",
          message: "Password Yang Anda Masukan Salah",
        });
        res.redirect("/login");
      }
    } else {
      req.flash("message", {
        alert: "failed",
        message: "User Not Found",
      });
      res.redirect("/login");
    }
  }
);

// controller logout
app.get("/logout", async (req, res) => {
  if (req.session.authenticated) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/login");
      }
    });
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/login");
  }
});

// app.post(
//   "/login",
//   [check("email", "Invalid email").isEmail()],

//   async (req, res) => {
//     var dataUser = await searchUserByUsername(req.body.username);
//     if (dataUser) {
//       if (await passwordVerification(req.body.password, dataUser.password)) {
//         req.session.authenticated = true;
//         req.session.dataUser = { id: dataUser.id, role_id: dataUser.role_id };

//         // Tambahkan kondisi untuk menetapkan req.session.authenticated berdasarkan role
//         if (req.session.dataUser.role_id === 1) {
//           req.session.authenticated = "superadmin";
//         } else if (req.session.dataUser.role_id === 2) {
//           req.session.authenticated = "admin";
//         } else if (req.session.dataUser.role_id === 3) {
//           req.session.authenticated = "customer";
//         }

//         if (
//           req.session.dataUser.role_id == 1 ||
//           req.session.dataUser.role_id == 2
//         ) {
//           res.redirect("/admin");
//         } else if (req.session.dataUser.role_id == 3) {
//           res.redirect("/");
//         }
//       } else {
//         req.flash("message", {
//           alert: "failed",
//           message: "Password Yang Anda Masukan Salah",
//         });
//         res.redirect("/login");
//       }
//     } else {
//       req.flash("message", {
//         alert: "failed",
//         message: "User Tidak Ditemukan",
//       });
//       res.redirect("/login");
//     }
//   }
// );

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
  req.session.authenticated = false;
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
      const duplicate = await duplicateUserName(value);

      if (duplicate) {
        throw new Error("Name already registered");
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

    body("password").custom(async (value) => {
      const duplicate = await duplicatePasswordUser(value);
      if (duplicate) {
        throw new Error("Password has been registered");
      }
      return true;
    }),
    body("username").custom(async (value) => {
      const duplicateUser = await duplicateUsernameUser(value);
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
        const addedUser = await addDataUser(
          req.body.username,
          req.body.nama,
          3,
          req.body.email,
          req.body.mobile_phone,
          req.body.password
        );

        if (addedUser) {
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
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
      const productName = req.query.product_name || null;
      const productsCount = await totalProducts(productName);

      const roleFilter = 3; // Filter for role === 3
      const userCount = await totalUser(roleFilter);

      const roleFilterAdmin = 2; // Filter for role === 3
      const adminCount = await totalUser(roleFilterAdmin);
      var userData = await searchUserByID(req.session.dataUser.id);
      res.render("index", {
        title: "VirtuVorgue",
        layout: "layout/core-index",
        productsCount,
        userCount,
        message: req.flash("message"),
        adminCount,
        userData,
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/login");
  }
});

// ================ MIDDLEWARE ADMIN ========================

// data-admin
app.get("/data-admin", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
      var userData = await searchUserByID(req.session.dataUser.id);
      const dataUser = await fetchDataUser();
      const userAdmin = dataUser.filter(
        (user) => user.role === 1 || user.role === 2
      );
      res.render("admin/data-admin", {
        title: "VirtuVorgue - Data Admin",
        layout: "layout/core-index",
        userAdmin,
        message: req.flash("message"),
        userData,
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/");
  }
});

// add data-admin
app.get("/data-admin/add", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
      var userData = await searchUserByID(req.session.dataUser.id);
      if (req.session.dataUser.role == 1) {
        res.render("admin/add-admin", {
          title: "VirtuVorgue - Add Admin",
          layout: "layout/core-index",
          message: req.flash("message"),
          userData,
        });
      } else {
        req.flash("message", {
          alert: "warning",
          message: "Admin Cannot Access the Add User Menu!",
        });
        res.redirect("/data-admin");
      }
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/login");
  }
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
    if (req.session.authenticated) {
      if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
        if (req.session.dataUser.role == 1) {
          var userData = await searchUserByID(req.session.dataUser.id);
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            res.render("admin/add-admin", {
              title: "VirtuVorgue - Add Admin",
              layout: "layout/core-index.ejs",
              errors: errors.array(),
              userData,
            });
          } else {
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
          }
        } else {
          req.flash("message", {
            alert: "warning",
            message: "Admin Cannot Access the Add Admin Menu!",
          });
          res.redirect("/data-admin");
        }
      } else {
        req.flash("message", { alert: "warning", message: "Access Denied!" });
        res.redirect("/");
      }
    } else {
      req.flash("message", {
        alert: "failed",
        message: "You Must Log In First!",
      });
      res.redirect("/");
    }
  }
);

// detail data-admin
app.get("/data-admin/detail-admin/:user_id", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
      var userData = await searchUserByID(req.session.dataUser.id);
      const adminId = req.params.user_id;
      const admins = await fetchDataUser();
      const admin = admins.find((data_admin) => data_admin.user_id == adminId); // Tambahkan pemanggilan fetchDataUser dengan parameter id_customer
      res.render("admin/detail-admin", {
        title: "VirtuVorgue - Detail Admin",
        layout: "layout/core-index.ejs",
        admin,
        userData,
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
  }
});

// update data-admin
app.get("/data-admin/update-admin/:user_id", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
      if (req.session.dataUser.role == 1) {
        var userData = await searchUserByID(req.session.dataUser.id);
        const admins = await searchUserByID(req.params.user_id);
        res.render("admin/update-admin", {
          title: "VirtuVorgue - Update Admin",
          layout: "layout/core-index",
          admins: req.body,
          userData,
          message: req.flash("message"),
        });
      } else {
        req.flash("message", {
          alert: "warning",
          message: "Admin Cannot Access the Update Admin Menu!",
        });
        res.redirect("/data-admin");
      }
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
  }
});

app.post(
  "/data-admin/update",
  [
    body("id_admin").custom(async (value, { req }) => {
      const duplicate = await duplicateUserName(value);
      if (value !== req.body.oldName && duplicate) {
        throw new Error("Name has been registered");
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
    body("password").custom(async (value) => {
      const passwordDuplicate = await duplicatePasswordUser(value);
      if (passwordDuplicate) {
        throw new Error("Password has been registered");
      }
      return true;
    }),
    check("email", "Invalid email").isEmail(),
    check("mobile_phone", "Something wrong with phone number").isMobilePhone(
      "id-ID"
    ),
  ],
  async (req, res) => {
    if (req.session.authenticated) {
      if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
        if (req.session.dataUser.role == 1) {
          var userData = await searchUserByID(req.session.dataUser.id);
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            res.render("admin/update-admin", {
              title: "VirtuVorgue - Update Admin",
              layout: "layout/core-index",
              errors: errors.array(),
              admins: req.body,
              userData,
            });

            await updateUser(req.body);
            req.flash("msg", "Data updated successfully");
            res.redirect("/data-admin");
          }
        } else {
          req.flash("message", {
            alert: "warning",
            message: "Admin Cannot Access the Update Admin Menu!",
          });
          res.redirect("/data-admin");
        }
      } else {
        req.flash("message", { alert: "warning", message: "Access Denied!" });
        res.redirect("/");
      }
    } else {
      req.flash("message", {
        alert: "failed",
        message: "You must log in first!",
      });
    }
  }
);

// delete data-admin / by ID
app.get("/data-admin/delete-admin/:user_id", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 1) {
      const deletedAdmin = await deleteDataUser(req.params.user_id);

      if (!deletedAdmin) {
        req.flash("msg", "Data not found or has been deleted");
      } else {
        req.flash("msg", "Data deleted successfully");
      }

      res.redirect("/data-admin");
    } else {
      req.flash("message", {
        alert: "warning",
        message: "Admin Cannot Access the Delete Menu!",
      });
      res.redirect("/data-admin");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
  }
});

// ================ END ADMIN =====================================================

// ================ MIDDLEWARE CUSTOMER ========================
// data-customer
app.get("/data-customer", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
      var userData = await searchUserByID(req.session.dataUser.id);
      const customers = await fetchDataUser();
      const cust = customers.filter((c) => c.role === 3);
      res.render("customers/data-customer", {
        title: "VirtuVorgue - Data Customer",
        layout: "layout/core-index",
        cust,
        userData,
        message: req.flash("message"),
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/");
  }
});

// // add data-admin
// app.get("/data-customer/add", (req, res) => {
//   res.render("customers/add-customer", {
//     title: "VirtuVorgue - Add Customer",
//     layout: "layout/core-index",
//   });
// });

// middleware ini akan di hapus
// middleware add customer
// app.post(
//   "/data-customer/add",
//   [
//     body("id_customer").custom(async (value) => {
//       const duplicate = await duplicateIdCustomerCheck(value);

//       if (duplicate) {
//         throw new Error("ID already registered");
//       }
//       return true;
//     }),
//     body("email").custom(async (value) => {
//       const emailDuplicate = await emailDuplicateCustomerCheck(value);
//       if (emailDuplicate) {
//         throw new Error("Email has been registered");
//       }
//       return true;
//     }),
//     check("email", "Invalid email").isEmail(),
//     check("mobile_phone", "mobile phone number invalid").isMobilePhone("id-ID"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.render("customers/add-customer", {
//         title: "VirtuVorgue - Add Customer",
//         layout: "layout/core-index.ejs",
//         errors: errors.array(),
//       });
//     } else {
//       try {
//         console.log("Data yang dikirim: ", req.body);

//         // Gunakan fungsi addDataAdmin dari model basis data
//         await addDataCustomer(
//           // Ekstrak data dari tubuh permintaan
//           req.body.id_customer,
//           req.body.username,
//           req.body.nama,
//           req.body.email,
//           req.body.mobile_phone
//         );
//         req.flash("msg", "Data added successfully");

//         // Redirect ke halaman data-admin untuk melihat data yang diperbarui
//         res.redirect("/data-customer");
//       } catch (err) {
//         console.error(err.msg);
//         req.flash("msg", "An error occurred while adding data");
//         res.status(500);
//       }
//     }
//   }
// );

// detail data-customer
app.get("/data-customer/detail-customer/:user_id", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 2) {
      var userData = await searchUserByID(req.session.dataUser.id);
      const customerId = req.params.user_id;
      const customers = await fetchDataUser();
      const customer = customers.find(
        (data_customer) => data_customer.user_id == customerId
      ); // Tambahkan pemanggilan fetchDataCustomer dengan parameter id_customer

      res.render("customers/detail-customer", {
        title: "VirtuVorgue - Detail Customer",
        layout: "layout/core-index.ejs",
        customer,
        userData,
        message: req.flash("message"),
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/");
  }
});

// update data-customer
// app.get("/data-customer/update-customer/:id_customer", async (req, res) => {
//   try {
//     const customers = await searchCustomer(req.params.id_customer);
//     res.render("customers/update-customer", {
//       title: "VirtuVorgue - Update Customer",
//       layout: "layout/core-index",
//       customers,
//     });
//   } catch (err) {
//     console.error(err.msg);
//     res.status(500);
//   }
// });

// app.post(
//   "/data-customer/update",
//   [
//     body("nama").custom(async (value, { req }) => {
//       const duplicate = await duplicateCustomerName(value);
//       if (value !== req.body.oldName && duplicate) {
//         throw new Error("Name has been registered");
//       }
//       return true;
//     }),
//     body("email").custom(async (value) => {
//       const emailDuplicate = await emailDuplicateCustomerCheck(value);
//       if (emailDuplicate) {
//         throw new Error("Email has been registered");
//       }
//       return true;
//     }),
//     check("email", "Invalid email").isEmail(),
//     check("mobile_phone", "Something wrong with phone number").isMobilePhone(
//       "id-ID"
//     ),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.render("customers/update-customer", {
//         title: "VirtuVorgue - Update Customer",
//         layout: "layout/core-index",
//         errors: errors.array(),
//         customers: req.body,
//       });
//     } else {
//       try {
//         await updateCustomer(req.body);
//         req.flash("msg", "Data updated successfully");
//         res.redirect("/data-customer");
//       } catch (err) {
//         console.error(err.msg);
//         res.status(500);
//       }
//     }
//   }
// );

// delete data-admin / by ID
app.get("/data-customer/delete-customer/:user_id", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 1) {
      const deletedCustomer = await deleteDataUser(req.params.user_id);

      if (!deletedCustomer) {
        req.flash("msg", "Data not found or has been deleted");
      } else {
        req.flash("msg", "Data deleted successfully");
      }

      res.redirect("/data-customer");
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/");
  }
});

// ================ END CUSTOMERS ========================

// ==================================== Products =======================================================
// Pc Product list
app.get("/products", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 2 || req.session.dataUser.role == 3) {
      var userData = await searchUserByID(req.session.dataUser.id);
      const products = await fetchDataProducts(req.query.product_name);
      res.render("products/products", {
        title: "VirtuVorgue - Products",
        layout: "layout/core-index",
        userData,
        products: products,
        message: req.flash("message"),
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/");
  }
});

// middlware untuk inventory item
app.get("/items", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 2) {
      const products = await fetchDataProducts();
      var userData = await searchUserByID(req.session.dataUser.id);
      res.render("inventory/items", {
        title: "VirtuVorgue - Items",
        layout: "layout/core-index",
        message: req.flash("message"),
        userData,
        products,
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/");
  }
});

// middleware add items
app.get("/items/add", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 2) {
      var userData = await searchUserByID(req.session.dataUser.id);
      res.render("inventory/add-items", {
        title: "VirtuVorgue - Add Items",
        layout: "layout/core-index",
        message: req.flash("message"),
        userData,
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/login");
  }
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

// app.post(
//   "/items/update",
//   [
//     body("id_admin").custom(async (value, { req }) => {
//       const duplicate = await duplicateName(value);
//       if (value !== req.body.oldName && duplicate) {
//         throw new Error("Name has been registered");
//       }
//       return true;
//     }),
//     body("email").custom(async (value) => {
//       const emailDuplicate = await emailDuplicateCheck(value);
//       if (emailDuplicate) {
//         throw new Error("Email has been registered");
//       }
//       return true;
//     }),
//     check("email", "Invalid email").isEmail(),
//     check("mobile_phone", "Something wrong with phone number").isMobilePhone(
//       "id-ID"
//     ),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.render("admin/update-admin", {
//         title: "VirtuVorgue - Update Admin",
//         layout: "layout/core-index",
//         errors: errors.array(),
//         admins: req.body,
//       });
//     } else {
//       try {
//         await updateAdmin(req.body);
//         req.flash("msg", "Data updated successfully");
//         res.redirect("/data-admin");
//       } catch (err) {
//         console.error(err.msg);
//         res.status(500);
//       }
//     }
//   }
// );

// middleware untuk detail items
app.get("/items/detail-products/:product_name", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 2) {
      var userData = await searchUserByID(req.session.dataUser.id);
      const productName = req.params.product_name;
      const findProduct = await fetchDataProducts();
      const products = findProduct.find(
        (products) => products.product_name === productName
      );

      res.render("inventory/detail-items", {
        title: "VirtuVorgue - Detail Product",
        layout: "layout/core-index.ejs",
        products,
        userData,
        message: req.flash("message"),
      });
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/");
  }
});

// delete products items
app.get("/items/delete-products/:product_name", async (req, res) => {
  if (req.session.authenticated) {
    if (req.session.dataUser.role == 2) {
      const deleteProducts = await deleteDataProducts(req.params.product_name);

      if (!deleteProducts) {
        req.flash("msg", "Data not found or has been deleted");
      } else {
        req.flash("msg", "Data deleted successfully");
      }

      res.redirect("/items");
    } else {
      req.flash("message", { alert: "warning", message: "Access Denied!" });
      res.redirect("/");
    }
  } else {
    req.flash("message", {
      alert: "failed",
      message: "You must log in first!",
    });
    res.redirect("/");
  }
});

// ==================================== End Products ======================================================

// ==================================== ERROR ====================================
app.use("/", async (req, res) => {
  var log = req.session.authenticated ? "true" : "false";
  if (req.session.authenticated) {
    var userData = await searchUserByID(req.session.dataUser.id);
    if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
      res.render("layout/error404", {
        title: "VirtuVorgue - Page Not Found",
        layout: "layout/error404",
        userData,
      });
    } else {
      res.render("layout/error404", {
        title: "VirtuVorgue - Page Not Found",
        logged: log,
        userData,
        layout: "layout/error404",
      });
    }
  } else {
    res.render("layout/error404", {
      title: "VirtuVorgue - Page Not Found",
      layout: "layout/error404",
      logged: log,
      userData,
    });
  }
});
// ==================================== End ERROR ====================================

// ==================================== Server running ====================================
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
// ==================================== End Server Running ====================================
