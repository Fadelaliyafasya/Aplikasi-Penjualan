const { searchUserByID } = require("../models/data_user");
const { searchCartByUserId, deleteCart } = require("../models/cart");
const {
  getAllTransactionByUserId,
  getDetailTransaction,
  addTransaction,
  getTransactionByInv,
  addTransactionDetail,
  fetchProductsById,
  updateQuantityProduct,
} = require("../models/transaction");

const moment = require("moment");

const now = moment().format("DD MMMM YYYY, HH:mm:ss");

const transactionController = {
  checkout: async (req, res) => {
    if (req.session.authenticated) {
      if (req.session.dataUser.role == 2 || req.session.dataUser.role == 3) {
        var tailCode;
        if (req.session.dataUser.id.toString().length == 1) {
          tailCode =
            req.session.dataUser.id + Date.now().toString().substring(4);
        } else if (req.session.dataUser.id.toString().length == 2) {
          tailCode =
            req.session.dataUser.id + Date.now().toString().substring(5);
        } else if (req.session.dataUser.id.toString().length == 3) {
          tailCode =
            req.session.dataUser.id + Date.now().toString().substring(6);
        } else {
          tailCode =
            req.session.dataUser.id + Date.now().toString().substring(7);
        }
        const invoice =
          "INV/" +
          new Date().getFullYear() +
          new Date().getMonth() +
          new Date().getDate() +
          "/VRVG/" +
          tailCode;
        var now = new Date();
        var transactionData = [invoice, req.session.dataUser.id, now];
        await addTransaction(transactionData);
        var transactionCheck = await getTransactionByInv(invoice);
        var dataCart = await searchCartByUserId(req.session.dataUser.id);

        if (dataCart.length === 0) {
          req.flash("message", {
            alert: "failed",
            message: "Your cart is empty!",
          });
          res.redirect("/cart");
          return;
        }

        const product_id = dataCart.map((item) => item.product_id);
        const product_name = dataCart.map((item) => item.product_name);
        const price = dataCart.map((item) => item.price);
        const quantity = dataCart.map((item) => item.jumlah_beli);

        var detailDataTransaction = [];
        for (let index = 0; index < product_id.length; index++) {
          detailDataTransaction[index] = [
            transactionCheck.id,
            product_name[index],
            quantity[index],
            price[index],
          ];
          await addTransactionDetail(detailDataTransaction[index]);
          const checkProduct = await fetchProductsById(product_id[index]);
          const remainingProduct =
            checkProduct.stock_quantity - quantity[index];
          await updateQuantityProduct(remainingProduct, product_id[index]);
          await deleteCart([req.session.dataUser.id, product_id[index]]);
        }

        req.flash("message", {
          alert: "success",
          message: "Successful Purchase! Please look at the Transaction Menu",
        });
        res.redirect("/cart");
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
        message: "You must login first!",
      });
      res.redirect("/login");
    }
  },

  showTransaction: async (req, res) => {
    if (req.session.authenticated) {
      if (req.session.dataUser.role == 2 || req.session.dataUser.role == 3) {
        var userData = await searchUserByID(req.session.dataUser.id);
        const transactionData = await getAllTransactionByUserId(
          req.session.dataUser.id
        );
        for (let index in transactionData) {
          transactionData[index].details = await getDetailTransaction(
            transactionData[index].id
          );
        }
        res.render("transaction", {
          title: "VirtuVorgue",
          layout: "layout/core-index",
          logged: "true",
          message: req.flash("message"),
          transactionData,
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
        message: "You Must Login First!",
      });
      res.redirect("/login");
    }
  },
};

module.exports = transactionController;
