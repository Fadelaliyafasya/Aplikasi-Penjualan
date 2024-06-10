const { validationResult } = require("express-validator");
const {
  fetchDataUser,
  addDataUser,
  searchUserByID,
  deleteDataUser,
  updateUser,
} = require("../models/data_user");

const adminController = {
  showAdminData: async (req, res) => {
    try {
      const userData = req.session.userData.id;
      const userAdmin = await fetchDataUser();
      res.render("admin/data-admin", {
        title: "VirtuVorgue - Data Admin",
        layout: "layout/core-index",
        userAdmin,
        userData,
        message: req.flash("message"),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  showAddAdminForm: async (req, res) => {
    try {
      res.render("admin/add-admin", {
        title: "VirtuVorgue - Add Admin",
        layout: "layout/core-index",
        message: req.flash("message"),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  addNewAdmin: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("message", {
          alert: "danger",
          message: errors.array(),
        });
        return res.redirect("/data-admin/add");
      }

      const { username, name, role, email, mobile_phone, password } = req.body;

      await addDataUser(username, name, role, email, mobile_phone, password);

      req.flash("message", {
        alert: "success",
        message: "Admin added successfully",
      });
      res.redirect("/data-admin");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  showAdminDetail: async (req, res) => {
    try {
      const userId = req.params.user_id;
      const admin = await searchUserByID(userId);
      res.render("admin/detail-admin", {
        title: "VirtuVorgue - Detail Admin",
        layout: "layout/core-index",
        admin,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  showUpdateAdminForm: async (req, res) => {
    try {
      const userId = req.params.user_id;
      const admin = await searchUserByID(userId);
      res.render("admin/update-admin", {
        title: "VirtuVorgue - Update Admin",
        layout: "layout/core-index",
        admin,
        message: req.flash("message"),
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  updateAdminData: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("message", {
          alert: "danger",
          message: errors.array(),
        });
        return res.redirect(`/data-admin/update-admin/${req.body.user_id}`);
      }

      await updateUser(req.body);

      req.flash("message", {
        alert: "success",
        message: "Admin updated successfully",
      });
      res.redirect("/data-admin");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      const userId = req.params.user_id;
      await deleteDataUser(userId);
      req.flash("message", {
        alert: "success",
        message: "Admin deleted successfully",
      });
      res.redirect("/data-admin");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = adminController;
