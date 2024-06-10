const { searchUserByID } = require("../models/data_user");

const dashboardController = {
  dashboard: async (req, res) => {
    try {
      var log = req.session.authenticated ? "true" : "false";
      var userData = req.session.authenticated
        ? await searchUserByID(req.session.dataUser.id)
        : null;

      res.render("dashboard-customer/dashboard", {
        title: "VirtuVorgue",
        logged: log,
        message: req.flash("message"),
        layout: "layout/core-index",
        userData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = dashboardController;
