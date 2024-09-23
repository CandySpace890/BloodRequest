const RequestModel = require("../models/requestModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const authenticateJWT = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).json({ status: 403, message: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = { id: decoded.id }; // Attach user ID to the request object
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: 401, message: "Invalid or expired token" });
  }
};

const getDashboardInfo = async (req, res) => {
  try {
    // Fetch all approval requests
    const allRequests = await RequestModel.getAllRequests();

    // Count total approval requests
    const totalRequests = allRequests.length;

    // Count approval requests in approved and rejected states
    const approvedRequests = allRequests.filter(
      (request) => request.approval_request_status === "approved"
    ).length;

    const rejectedRequests = allRequests.filter(
      (request) => request.approval_request_status === "rejected"
    ).length;

    // Count donation requests and blood requests
    const donationRequests = allRequests.filter(
      (request) => request.requestType === "donations"
    ).length;

    const bloodRequests = allRequests.filter(
      (request) => request.requestType === "blood_requests"
    ).length;

    // Send response with status
    res.status(200).json({
      status: 200,
      message: "Dashboard info retrieved successfully",
      data:{
      
      totalRequests,
      approvedRequests,
      rejectedRequests,
      donationRequests,
      bloodRequests,
     
    }});
  } catch (error) {
    console.error("Unable to get dashboard info. Error:", error);
    res.status(500).json({
      status: 500,
      message: "Error fetching dashboard info",
    });
  }
};

module.exports = {
  getDashboardInfo: [authenticateJWT, getDashboardInfo],
};
