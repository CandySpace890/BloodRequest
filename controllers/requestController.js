const RequestModel = require("../models/requestModel");
const BloodSampleModel = require("../models/bloodSampleModel");
const UserModel = require("../models/userModel");
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

  try {
    const user = await UserModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user.isAdmin) {
      return res.status(404).json({ message: "admin cannot raise or donate" });
    }
    if (requestType != "donations" && requestType != "blood_requests") {
      return res.status(404).json({ message: "invalid request type" });
    }

    const userName = `${user.first_name} ${user.last_name}`;
    const bloodGroup = user.blood_group;
    const bloodSampleId = user.blood_sample_id;
    const dob = user.dob;

    const newRequest = await RequestModel.createRequest(
      requestType,
      userId,
      userName,
      disease,
      dob,
      units,
      bloodGroup,
      bloodSampleId
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
  const { requestId, approval_request_status } = req.body;
  const adminId = req.user.id;

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Only admins can review requests" });
  }
  if (approval_request_status != "approved" && approval_request_status != "rejected") {
    return res.status(403).json({ message: "invalid status" });
  }

  try {
    const updatedRequest = await RequestModel.updateRequestStatus(
      requestId,
      approval_request_status,
      adminId
    );

    // If the request is approved, update blood samples accordingly
    if (approval_request_status === "approved") {
      if (updatedRequest.requestType === "donation") {
        await BloodSampleModel.updateSampleUnits(
          updatedRequest.bloodSampleId,
          updatedRequest.units
        );
      }
    }

    return res.status(200).json({
      message: `Request ${approval_request_status} successfully`,
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
    console.log("request Type ", requestType);
    if (!requestType) {
      return res.status(200).json({
        is_error: true,
        message: "request type is mandatory",
      });
    }
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
    const usersWithAge = requests.map((user) => {
      if (user.data) {
        const dob = parseDate(user.data); // Parse the DOB
        user.age = calculateAge(dob); // Add the age to the user object
      }
      return user;
    });

    return res.status(200).json({
      message: "All requests retrieved successfully",
      usersWithAge,
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

// Helper function to parse DD-MM-YYYY format into a Date object
const parseDate = (dobString) => {
  const [day, month, year] = dobString.split("-").map(Number);
  return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript Date
};

// Helper function to calculate age based on date of birth
const calculateAge = (dob) => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  // If the birthday hasn't occurred yet this year, subtract one from the age
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};
