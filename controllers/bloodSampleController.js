const BloodSampleModel = require("../models/bloodSampleModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const authenticateJWT = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = { id: decoded.id }; // Attach user ID to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const getAllBloodSamples = async (req, res) => {
  try {
    const bloodSamples = await BloodSampleModel.getAllSamples();
    return res.status(200).json({
      message: "Blood samples retrieved successfully",
      bloodSamples,
    });
  } catch (error) {
    console.error("Error retrieving blood samples:", error);
    return res
      .status(500)
      .json({ message: "Could not retrieve blood samples" });
  }
};

const getBloodSampleByType = async (req, res) => {
  const { blood_type } = req.params;

  try {
    const sample = await BloodSampleModel.getSampleByBloodType(blood_type);
    if (!sample) {
      return res.status(404).json({ message: "Blood sample not found" });
    }

    return res.status(200).json({
      message: "Blood sample retrieved successfully",
      sample,
    });
  } catch (error) {
    console.error("Error retrieving blood sample:", error);
    return res.status(500).json({ message: "Could not retrieve blood sample" });
  }
};

const updateBloodSampleUnits = async (req, res) => {
  //   const { blood_type } = req.params;
  const { blood_sample_id, units } = req.body;

  try {
    const sample = await BloodSampleModel.getSampleByID(blood_sample_id);
    if (!sample) {
      return res.status(404).json({ message: "Blood sample not found" });
    }

    const updatedSample = await BloodSampleModel.updateSampleUnits(
      blood_sample_id,
      units
    );
    return res.status(200).json({
      message: "Blood sample updated successfully",
      updatedSample,
    });
  } catch (error) {
    console.error("Error updating blood sample:", error);
    return res.status(500).json({ message: "Could not update blood sample" });
  }
};

const createBloodSample = async (req, res) => {
  const { blood_type, units } = req.body;

  try {
    const existingSample = await BloodSampleModel.getSampleByBloodType(
      blood_type
    );
    if (existingSample) {
      return res.status(400).json({ message: "Blood sample already exists" });
    }

    const newSample = await BloodSampleModel.createBloodSample(
      blood_type,
      units
    );
    return res.status(201).json({
      message: "Blood sample created successfully",
      newSample,
    });
  } catch (error) {
    console.error("Error creating blood sample:", error);
    return res.status(500).json({ message: "Could not create blood sample" });
  }
};

const deleteBloodSample = async (req, res) => {
  const { blood_sample_id } = req.body;

  try {
    await BloodSampleModel.deleteBloodSample(blood_sample_id);
    return res.status(200).json({
      message: "Blood sample deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blood sample:", error);
    return res.status(500).json({ message: "Could not delete blood sample" });
  }
};

module.exports = {
  getAllBloodSamples: [authenticateJWT, getAllBloodSamples],
  getBloodSampleByType: [authenticateJWT, getBloodSampleByType],
  updateBloodSampleUnits: [authenticateJWT, updateBloodSampleUnits],
  createBloodSample: [authenticateJWT, createBloodSample],
  deleteBloodSample: [authenticateJWT, deleteBloodSample],
};
