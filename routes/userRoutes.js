const express = require("express");
const {
  createUser,
  loginUser,
  getUserInfo,
  updateUserDetails,
  getAllUsers,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/createUser", createUser);
router.post("/login", loginUser);
router.get("/getUserInfo", getUserInfo);
router.post("/updateUser", updateUserDetails);
router.get("/getAllUsers", getAllUsers);
router.post("/deleteUser", deleteUser);
// router.post("/:id/status", changeUserStatus);

module.exports = router;
