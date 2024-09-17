const express = require("express");
const {
  createPost,
  getPostById,
  getAllPosts,
  deletePost,
} = require("../controllers/postController");
const {
  createComment,
  getCommentsByPostId,
  deleteComment,
} = require("../controllers/postController");

const router = express.Router();

router.post("/createPost", createPost);
router.get("/posts/:id", getPostById);
router.get("/posts", getAllPosts);
router.delete("/posts/:id", deletePost);

router.post("/:post_id/comments", createComment);
router.get("/:post_id/comments", getCommentsByPostId);
router.delete("/comments/:comment_id", deleteComment);

module.exports = router;
