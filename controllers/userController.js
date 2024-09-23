const BloodSampleModel = require("../models/bloodSampleModel");
const UserModel = require("../models/userModel");
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
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = { id: decoded.id }; // Attach user ID to the request object
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: 401, message: "Invalid or expired token" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.getUserByEmail(email);

    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid credentials" });
    }

    if (!user.active) {
      return res
        .status(403)
        .json({ status: 403, message: "User account is inactive" });
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: user.userType === "admin" },
      SECRET_KEY,
      {
        expiresIn: "24h", // Token expiration time
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Could not log in user" });
  }
};

const createUser = async (req, res) => {
  const { email, password, first_name, last_name, dob, blood_group } = req.body;

  try {
    const user = await UserModel.getUserByEmail(email);

    if (user && user.active) {
      return res
        .status(401)
        .json({ status: 401, message: "User already exists" });
    }

    const bloodSample = await BloodSampleModel.getSampleByBloodType(
      blood_group
    );

    if (!bloodSample) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid blood group" });
    }

    if (!email || !password || !first_name || !last_name || !dob) {
      return res
        .status(400)
        .json({ status: 400, message: "All fields are required" });
    }

    const blood_sample_id = bloodSample.id;
    const newUser = await UserModel.createUser({
      email,
      first_name,
      last_name,
      password,
      dob,
      blood_group,
      blood_sample_id,
    });

    return res.status(201).json({
      status: 201,
      message: "User created successfully",
      newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Could not create user" });
  }
};

const getUserInfo = async (req, res) => {
  const user_id = req.user.id;

  try {
    console.log("User ID ", user_id);
    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    if (user.dob) {
      const dob = parseDate(user.dob); // Parse the stored DOB
      const age = calculateAge(dob);
      user.age = age; // Add age to the user object
    }
    return res.status(200).json({
      status: 200,
      message: "User information retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Could not retrieve user information" });
  }
};

const updateUserDetails = async (req, res) => {
  const user_id = req.user.id;

  try {
    console.log("User ID ", user_id);
    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const updateData = req.body;
    if (updateData.email) {
      return res
        .status(400)
        .json({ status: 400, message: "Cannot update email" });
    }

    const updatedUser = await UserModel.updateUser(user_id, updateData);

    return res.status(200).json({
      status: 200,
      message: "User details updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Could not update user details" });
  }
};

const getAllUsers = async (req, res) => {
  const user_id = req.user.id;

  try {
    console.log("User ID ", user_id);
    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    if (user.userType !== "admin") {
      return res
        .status(403)
        .json({ status: 403, message: "User is not an admin" });
    }

    const users = await UserModel.getAllUsers();

    // Append age to each user if DOB exists
    const usersWithAge = users.map((user) => {
      if (user.dob) {
        const dob = parseDate(user.dob); // Parse the DOB
        user.age = calculateAge(dob); // Add the age to the user object
      }
      return user;
    });

    return res.status(200).json({
      status: 200,
      message: "User information retrieved successfully",
      users: usersWithAge,
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Could not retrieve user information" });
  }
};

const deleteUser = async (req, res) => {
  const user_id = req.user.id;
  const { deletable_user_id } = req.body;
  try {
    console.log("User ID ", user_id);
    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    if (user.userType !== "admin") {
      return res
        .status(403)
        .json({ status: 403, message: "User is not admin" });
    }

    await UserModel.deleteUser(deletable_user_id);

    return res.status(200).json({
      status: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Could not delete user" });
  }
};

module.exports = {
  createUser,
  loginUser,

  getUserInfo: [authenticateJWT, getUserInfo],
  updateUserDetails: [authenticateJWT, updateUserDetails],
  getAllUsers: [authenticateJWT, getAllUsers],
  deleteUser: [authenticateJWT, deleteUser],
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
