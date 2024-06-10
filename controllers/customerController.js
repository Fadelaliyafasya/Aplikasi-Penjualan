const { validationResult } = require("express-validator");
const { fetchDataUser, deleteDataUser } = require("../models/data_user");

const { searchUserByID } = require("../models/data_user");
const customerController = {
  dashboard: async (req, res) => {
    const log = req.session.authenticated ? "true" : "false";

    const userData = await searchUserByID(req.session.dataUser.id);
    res.render("dashboard-customer/dashboard", {
      title: "VirtuVorgue",
      logged: log,
      message: req.flash("message"),
      layout: "layout/core-index",
      userData,
    });
  },

  showCustomerData: async (req, res) => {
    if (req.session.dataUser.role == 1 || req.session.dataUser.role == 2) {
      try {
        const userData = await searchUserByID(req.session.dataUser.id);
        const customers = await fetchDataUser();
        const cust = customers.filter((c) => c.role === 3);
        res.render("customers/data-customer", {
          title: "VirtuVorgue - Data Customer",
          layout: "layout/core-index",
          cust,
          userData,
          message: req.flash("message"),
        });
      } catch (error) {
        console.error(error);
        req.flash("message", {
          alert: "danger",
          message: "Failed to fetch customer data.",
        });
        res.redirect("/");
      }
    } else {
      req.flash("message", {
        alert: "warning",
        message: "Limited Access: Permission access Denied!",
      });
      res.redirect("/");
    }
  },

  showCustomerDetail: async (req, res) => {
    if (req.session.dataUser.role == 2) {
      try {
        const userData = await searchUserByID(req.session.dataUser.id);
        const customerId = req.params.user_id;
        const customers = await fetchDataUser();
        const customer = customers.find(
          (data_customer) => data_customer.user_id == customerId
        );
        res.render("customers/detail-customer", {
          title: "VirtuVorgue - Detail Customer",
          layout: "layout/core-index.ejs",
          customer,
          userData,
          message: req.flash("message"),
        });
      } catch (error) {
        console.error(error);
        req.flash("message", {
          alert: "danger",
          message: "Failed to fetch customer details.",
        });
        res.redirect("/");
      }
    } else {
      req.flash("message", {
        alert: "warning",
        message: "Limited Access: Permission access Denied!",
      });
      res.redirect("/");
    }
  },

  deleteCustomer: async (req, res) => {
    if (req.session.dataUser.role == 1) {
      try {
        const deletedCustomer = await deleteDataUser(req.params.user_id);

        if (!deletedCustomer) {
          req.flash("msg", "Data not found or has been deleted");
        } else {
          req.flash("msg", "Data deleted successfully");
        }

        res.redirect("/data-customer");
      } catch (error) {
        console.error(error);
        req.flash("msg", "Failed to delete customer data");
        res.redirect("/data-customer");
      }
    } else {
      req.flash("message", {
        alert: "warning",
        message: "Limited Access: Permission access Denied!",
      });
      res.redirect("/");
    }
  },
};

module.exports = customerController;
