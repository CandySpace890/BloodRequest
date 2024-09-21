const express = require("express");
const { getDashboardInfo } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/getDashboardInfo", getDashboardInfo);
// router.post("/:id/status", changeUserStatus);

module.exports = router;
