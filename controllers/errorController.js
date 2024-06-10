const { searchUserByID } = require("../models/data_user");

const errorController = {
  error404: async (req, res) => {
    try {
      var log = req.session.authenticated ? "true" : "false";
      var userData = req.session.authenticated
        ? await searchUserByID(req.session.dataUser.id)
        : null;

      res.status(404).render("layout/error404", {
        title: "VirtuVorgue - Page Not Found",
        logged: log,
        userData,
        layout: "layout/error404",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = errorController;
