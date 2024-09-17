const UserModel = require("../models/userModel");
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

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.getUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.active) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "24h", // Token expiration time
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Could not log in user" });
  }
};

const createUser = async (req, res) => {
  const { email, password, first_name, last_name, dob, blood_group } = req.body;

  try {
    const user = await UserModel.getUserByEmail(email);

    if (user && user.active) {
      return res.status(401).json({ message: "User already exists" });
    }

    const newUser = await UserModel.createUser({
      email,
      first_name,
      last_name,
      password,
      dob,
      blood_group,
    });

    return res.status(201).json({
      message: "User created successfully",
      newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Could not create user" });
  }
};

const getUserInfo = async (req, res) => {
  const user_id = req.user.id;

  try {
    console.log("User ID ", user_id);
    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // if (user.dob) {
    //   const dob = new Date(user.dob);
    //   console.log("Date DOB", user.dob);
    //   const age = calculateAge(dob);
    //   user.age = age; // Add age to the user object
    // }
    if (user.dob) {
      const dob = parseDate(user.dob); // Parse the stored DOB
      const age = calculateAge(dob);
      user.age = age; // Add age to the user object
    }
    return res.status(200).json({
      message: "User information retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return res
      .status(500)
      .json({ message: "Could not retrieve user information" });
  }
};

const updateUserDetails = async (req, res) => {
  const user_id = req.user.id;

  try {
    console.log("User ID ", user_id);
    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = req.body;
    if (updateData.email) {
      return res.status(400).json({ message: "Cannot update email" });
    }

    const updatedUser = await UserModel.updateUser(user_id, updateData);

    return res.status(200).json({
      message: "User details updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ message: "Could not update user details" });
  }
};
const getAllUsers = async (req, res) => {
  const user_id = req.user.id;

  try {
    console.log("User ID ", user_id);
    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.userType != "admin") {
      return res.status(403).json({ message: "User is not an admin" });
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
      message: "User information retrieved successfully",
      users: usersWithAge,
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return res
      .status(500)
      .json({ message: "Could not retrieve user information" });
  }
};

const deleteUser = async (req, res) => {
  const user_id = req.user.id;
  const { deletable_user_id } = req.body;
  try {
    console.log("User ID ", user_id);
    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.userType != "admin") {
      return res.status(404).json({ message: "user is not admin" });
    }

    await UserModel.deleteUser(deletable_user_id);

    return res.status(200).json({
      message: "User Deleted Successfuly",
    });
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return res
      .status(500)
      .json({ message: "Could not retrieve user information" });
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
