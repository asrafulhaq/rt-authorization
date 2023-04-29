const express = require("express");
const { login, refresh, logout } = require("../controllers/authController");

const router = express.Router();

// routing
router.route("/login").post(login);
router.route("/refresh").get(refresh);
router.route("/logout").post(logout);

// export
module.exports = router;
