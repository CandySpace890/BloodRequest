// routes/preflightRoutes.js
const express = require("express");
const router = express.Router();

// Handle the OPTIONS request for preflight checks
router.options("/*", (req, res) => {
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204); // No Content
});

module.exports = router;
