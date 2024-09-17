const PostModel = require("../models/postsModel");
const UserModel = require("../models/userModel");
const CommentModel = require("../models//commentModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const createPost = async (req, res) => {
  const {
    description,
    disaster_type,
    status,
    title,
    location,
    attachment_link,
    user_id,
  } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res
      .status(400)
      .json({ error: "Title is required and must be a non-empty string" });
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim() === ""
  ) {
    return res.status(400).json({
      error: "Description is required and must be a non-empty string",
    });
  }

  if (
    !disaster_type ||
    typeof disaster_type !== "string" ||
    disaster_type.trim() === ""
  ) {
    return res.status(400).json({
      error: "Disaster type is required and must be a non-empty string",
    });
  }

  if (!status || typeof status !== "string" || status.trim() === "") {
    return res
      .status(400)
      .json({ error: "Status is required and must be a non-empty string" });
  }

  if (!location || typeof location !== "string" || location.trim() === "") {
    return res
      .status(400)
      .json({ error: "Location is required and must be a non-empty string" });
  }

  if (
    !attachment_link ||
    typeof attachment_link !== "string" ||
    attachment_link.trim() === ""
  ) {
    return res
      .status(400)
      .json({ error: "Location is required and must be a non-empty string" });
  }

  try {
    const user = await UserModel.getUserById(user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.user_type != "Volunteer") {
      return res.status(404).json({ error: "User is not volunteer" });
    }

    const post = await PostModel.createPost({
      description,
      disaster_type,
      status,
      title,
      user_id,
      location,
      attachment_link,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create post" });
  }
};

const getPostById = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await PostModel.getPostById(postId);
    res.status(200).json({
      message: "Post retrieved successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Post not found" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.getAllPosts();
    res.status(200).json({
      message: "Posts retrieved successfully",
      totalPosts: posts.length,
      posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve posts" });
  }
};

const deletePost = async (req, res) => {
  const postId = req.params.id;

  try {
    await PostModel.deletePost(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete post" });
  }
};

const createComment = async (req, res) => {
  const { post_id, user_id, text } = req.body;

  try {
    const post = await PostModel.getPostById(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await UserModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const comment = await CommentModel.createComment({
      post_id,
      user_id,
      text,
    });
    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create comment" });
  }
};

const getCommentsByPostId = async (req, res) => {
  const post_id = req.params.post_id;

  try {
    const comments = await CommentModel.getCommentsByPostId(post_id);
    res
      .status(200)
      .json({ message: "Comments retrieved successfully", comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve comments" });
  }
};

const deleteComment = async (req, res) => {
  const comment_id = req.params.comment_id;

  try {
    await CommentModel.deleteComment(comment_id);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete comment" });
  }
};

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Invalid token
      }

      req.userId = user.userId; // Store the userId in the request object for use in other routes
      next();
    });
  } else {
    res.sendStatus(401); // No token provided
  }
};

module.exports = {
  createPost: [authenticateJWT, createPost],
  getPostById: [authenticateJWT, getPostById],
  getAllPosts: [authenticateJWT, getAllPosts],
  deletePost: [authenticateJWT, deletePost],
  createComment: [authenticateJWT, createComment],
  getCommentsByPostId: [authenticateJWT, getCommentsByPostId],
  deleteComment: [authenticateJWT, deleteComment],
};
