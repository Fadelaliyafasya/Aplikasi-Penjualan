const {
  fetchDataProducts,
  duplicateProductsName,
  addDataProducts,
  deleteDataProducts,
} = require("../models/data_products");

const { searchUserByID } = require("../models/data_user");

const { body, validationResult } = require("express-validator");
const multer = require("multer"); // Correctly requiring multer

// Multer storage configuration
const storage = multer.diskStorage({
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

const upload = multer({
  storage: storage,
});

const authController = {
  getProductList: async (req, res) => {
    try {
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
          req.flash("message", {
            alert: "warning",
            message: "Limited Access: Permission access Denied!",
          });
          res.redirect("/");
        }
      } else {
        req.flash("message", {
          alert: "failed",
          message: "You must log in first!",
        });
        res.redirect("/");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  getInventoryItems: async (req, res) => {
    try {
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
          req.flash("message", {
            alert: "warning",
            message: "Limited Access: Permission access Denied!",
          });
          res.redirect("/");
        }
      } else {
        req.flash("message", {
          alert: "failed",
          message: "You must log in first!",
        });
        res.redirect("/");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  getAddItemPage: async (req, res) => {
    try {
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
          req.flash("message", {
            alert: "warning",
            message: "Limited Access: Permission access Denied!",
          });
          res.redirect("/");
        }
      } else {
        req.flash("message", {
          alert: "failed",
          message: "You must log in first!",
        });
        res.redirect("/login");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  addItem: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Handle validation errors
      } else {
        upload.single("image")(req, res, async function (err) {
          if (err instanceof multer.MulterError) {
            console.log(err);
            req.flash("msg", "An error occurred while uploading image");
            return res.redirect("/items");
          } else if (err) {
            console.log(err);
            req.flash("msg", "An unknown error occurred");
            return res.redirect("/items");
          }

          if (!req.file) {
            req.body.image = "default.png";
          } else {
            if (!/^image/.test(req.file.mimetype)) {
              req.flash("msg", "File must be an image");
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
        });
      }
    } catch (error) {
      console.error(error);
      req.flash("msg", "An error occurred while adding data");
      res.status(500).send("<h1>Internal Server Error</h1>");
    }
  },

  getItemDetails: async (req, res) => {
    try {
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
          req.flash("message", {
            alert: "warning",
            message: "Limited Access: Permission access Denied!",
          });
          res.redirect("/");
        }
      } else {
        req.flash("message", {
          alert: "failed",
          message: "You must log in first!",
        });
        res.redirect("/");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  deleteProduct: async (req, res) => {
    try {
      if (req.session.authenticated) {
        if (req.session.dataUser.role == 2) {
          const deleteProducts = await deleteDataProducts(
            req.params.product_name
          );

          if (!deleteProducts) {
            req.flash("msg", "Data not found or has been deleted");
          } else {
            req.flash("msg", "Data deleted successfully");
          }

          res.redirect("/items");
        } else {
          req.flash("message", {
            alert: "warning",
            message: "Limited Access: Permission access Denied!",
          });
          res.redirect("/");
        }
      } else {
        req.flash("message", {
          alert: "failed",
          message: "You must log in first!",
        });
        res.redirect("/");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = authController;
