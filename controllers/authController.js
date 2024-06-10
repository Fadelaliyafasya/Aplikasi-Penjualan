const { validationResult, body } = require("express-validator");
const bcrypt = require("bcrypt");
const {
  searchUserByUsername,
  addDataUser,
  duplicateUserName,
  emailDuplicateUserCheck,
  duplicateUsernameUser,
} = require("../models/data_user");

// Verifikasi
async function passwordVerification(password, passwordHash) {
  const result = await bcrypt.compare(password, passwordHash);
  return result;
}

const authController = {
  loginPage: async (req, res) => {
    if (req.session.authenticated) {
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
  },

  login: [
    body("password", "Password Harus Diisi").notEmpty().trim(),
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          req.flash("message", {
            alert: "failed",
            message: errors.array()[0].msg,
          });
          return res.redirect("/login");
        }

        const dataUser = await searchUserByUsername(req.body.username);

        if (dataUser) {
          if (
            await passwordVerification(req.body.password, dataUser.password)
          ) {
            req.session.authenticated = true;
            req.session.dataUser = {
              id: dataUser.user_id,
              role: dataUser.role,
            };

            if (
              req.session.dataUser.role == 1 ||
              req.session.dataUser.role == 2
            ) {
              res.redirect("/dashboard");
            } else if (req.session.dataUser.role == 3) {
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
      } catch (error) {
        console.error(error);
        req.flash("message", {
          alert: "failed",
          message: "An error occurred during login",
        });
        res.redirect("/login");
      }
    },
  ],

  logout: (req, res) => {
    if (req.session.authenticated) {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          res.redirect("/login");
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
  },

  registerPage: (req, res) => {
    req.session.authenticated = false;
    res.render("layout/register-page", {
      title: "VirtuVorgue - Register",
      layout: "layout/register-page",
    });
  },

  register: [
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
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("username").custom(async (value) => {
      const duplicateUser = await duplicateUsernameUser(value);
      if (duplicateUser) {
        throw new Error("User has been registered");
      }
      return true;
    }),
    body("email", "Invalid email").isEmail(),
    body("mobile_phone", "mobile phone number invalid").isMobilePhone("id-ID"),
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("layout/register-page", {
          title: "VirtuVorgue - Register",
          layout: "layout/register-page",
          errors: errors.array(),
        });
      }

      try {
        console.log("Data yang dikirim: ", req.body);
        const addedUser = await addDataUser(
          req.body.username,
          req.body.nama,
          3,
          req.body.email,
          req.body.mobile_phone,
          req.body.password
        );

        if (addedUser) {
          req.flash("message", {
            alert: "success",
            message: "Data added successfully and you can login now",
          });
        } else {
          throw new Error("Failed to Register");
        }

        res.redirect("/login");
      } catch (err) {
        console.error(err.message);
        req.flash("message", { alert: "failed", message: err.message });
        res.status(500).redirect("/register");
      }
    },
  ],
};

module.exports = authController;
