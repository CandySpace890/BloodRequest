const RequestModel = require("../models/requestModel");
const BloodSampleModel = require("../models/bloodSampleModel");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

const authenticateJWT = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = { id: decoded.id, isAdmin: decoded.isAdmin }; // Attach user and role
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Create approval request
const createRequest = async (req, res) => {
  const { requestType, units, disease } = req.body;
  const userId = req.user.id;

  //   userId,
  //   userName,
  //   disease,
  //   dob,
  //   units,
  //   blood_group,
  try {
    const user = await UserModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newRequest = await RequestModel.createRequest(
      requestType,
      units,
      disease,
      userId,
      user.id,
      user.first_name + user.last_name,
      disease,
      user.dob,
      units,
      user.blood_group
    );
    return res.status(201).json({
      message: "Approval request created successfully",
      newRequest,
    });
  } catch (error) {
    console.error("Error creating approval request:", error);
    return res
      .status(500)
      .json({ message: "Could not create approval request" });
  }
};

// Review approval request (approve/reject)
const reviewRequest = async (req, res) => {
  const { requestId, status } = req.body;
  const adminId = req.user.id;

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Only admins can review requests" });
  }

  try {
    const updatedRequest = await RequestModel.updateRequestStatus(
      requestId,
      status,
      adminId
    );

    // If the request is approved, update blood samples accordingly
    if (status === "approved") {
      if (updatedRequest.requestType === "donation") {
        await BloodSampleModel.updateSampleUnits(
          updatedRequest.bloodSampleId,
          1
        );
      }
    }

    return res.status(200).json({
      message: `Request ${status} successfully`,
      updatedRequest,
    });
  } catch (error) {
    console.error("Error reviewing approval request:", error);
    return res
      .status(500)
      .json({ message: "Could not review approval request" });
  }
};

// Fetch approval requests by user and type
const getRequestsByUser = async (req, res) => {
  const { requestType } = req.params;
  const userId = req.user.id;

  try {
    const requests = await RequestModel.getRequestsByUser(userId, requestType);
    return res.status(200).json({
      message: "Requests retrieved successfully",
      requests,
    });
  } catch (error) {
    console.error("Error fetching approval requests:", error);
    return res
      .status(500)
      .json({ message: "Could not fetch approval requests" });
  }
};

// Fetch all approval requests (admin only)
const getAllRequests = async (req, res) => {
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Only admins can fetch all requests" });
  }

  try {
    const requests = await RequestModel.getAllRequests();
    return res.status(200).json({
      message: "All requests retrieved successfully",
      requests,
    });
  } catch (error) {
    console.error("Error fetching all approval requests:", error);
    return res
      .status(500)
      .json({ message: "Could not fetch all approval requests" });
  }
};

// Delete approval request
const deleteRequest = async (req, res) => {
  const { requestId } = req.body;

  try {
    await RequestModel.deleteRequest(requestId);
    return res.status(200).json({
      message: "Approval request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting approval request:", error);
    return res
      .status(500)
      .json({ message: "Could not delete approval request" });
  }
};

module.exports = {
  createRequest: [authenticateJWT, createRequest],
  reviewRequest: [authenticateJWT, reviewRequest],
  getRequestsByUser: [authenticateJWT, getRequestsByUser],
  getAllRequests: [authenticateJWT, getAllRequests],
  deleteRequest: [authenticateJWT, deleteRequest],
};
