const express = require("express");
const {
  getAllBloodSamples,
  getBloodSampleByType,
  updateBloodSampleUnits,
  createBloodSample,
  deleteBloodSample,
  getOnlyBloodSampleNames,
} = require("../controllers/bloodSampleController");

const router = express.Router();

router.get("/getAllBloodSamples", getAllBloodSamples);
router.get("/getBloodSamples", getOnlyBloodSampleNames);
router.get("/getBloodSampleByType", getBloodSampleByType);
router.post("/updateBloodSampleUnits", updateBloodSampleUnits);
router.post("/createBloodSample", createBloodSample);
router.post("/deleteBloodSample", deleteBloodSample);
// router.post("/:id/status", changeUserStatus);

module.exports = router;
