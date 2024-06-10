const { searchUserByID } = require("../models/data_user");
const {
  searchCartByUserId,
  searchCart,
  addCart,
  updateCart,
  deleteCart,
} = require("../models/cart");
const { fetchProductsById } = require("../models/data_products");

const cartController = {
  showCart: async (req, res) => {
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
  },

  addToCart: async (req, res) => {
    if (req.session.authenticated) {
      var cartCheck = await searchCart(
        req.session.dataUser.id,
        req.params.product_id
      );

      if (cartCheck) {
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
  },

  sumCartItem: async (req, res) => {
    if (req.session.authenticated) {
      var dataProduct = await fetchProductsById(req.params.product_id);
      var cartCheck = await searchCart(
        req.session.dataUser.id,
        req.params.product_id
      );
      var quantityUpdate = cartCheck.quantity + 1;

      if (quantityUpdate <= dataProduct.stock_quantity) {
        var data = [
          req.session.dataUser.id,
          req.params.product_id,
          quantityUpdate,
        ];
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
  },

  subtractCartItem: async (req, res) => {
    if (req.session.authenticated) {
      var cartCheck = await searchCart(
        req.session.dataUser.id,
        req.params.product_id
      );
      var quantityUpdate = cartCheck.quantity - 1;

      if (quantityUpdate > 0) {
        var data = [
          req.session.dataUser.id,
          req.params.product_id,
          quantityUpdate,
        ];
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
  },
};

module.exports = cartController;
