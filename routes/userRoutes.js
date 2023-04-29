const express = require("express");
const {
  getAllUser,
  createUser,
  getSingleUser,
  deleteUser,
  updateUser,
} = require("../controllers/userController");
const tokenVerify = require("../middlewares/tokenVerify");

const router = express.Router();

router.use(tokenVerify);

// routing
router.route("/").get(getAllUser).post(createUser);
router.route("/:id").get(getSingleUser).delete(deleteUser).patch(updateUser);

// export
module.exports = router;
