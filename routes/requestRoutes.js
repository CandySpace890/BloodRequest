const express = require("express");
const {
  createRequest,
  reviewRequest,
  getAllRequests,
  getRequestsByUser,
  deleteRequest,
} = require("../controllers/requestController");

const router = express.Router();

router.post("/createRequest", createRequest);
router.post("/reviewRequest", reviewRequest);
router.get("/getAllrequests", getAllRequests);
router.get("/getRequestsByUser/:requestType", getRequestsByUser);
router.post("/deleteRequest", deleteRequest);
// router.post("/:id/status", changeUserStatus);

module.exports = router;
