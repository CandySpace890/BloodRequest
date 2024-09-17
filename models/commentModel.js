const dynamoDb = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const COMMENT_TABLE = "comments";

const CommentModel = {
  createComment: async (commentData) => {
    const { post_id, user_id, text } = commentData;
    const comment_id = uuidv4();

    const params = {
      TableName: COMMENT_TABLE,
      Item: {
        comment_id,
        post_id,
        user_id,
        text,
      },
    };

    await dynamoDb.put(params).promise();
    return { comment_id, post_id, user_id, text };
  },

  getCommentsByPostId: async (post_id) => {
    const params = {
      TableName: COMMENT_TABLE,
      FilterExpression: "post_id = :post_id",
      ExpressionAttributeValues: {
        ":post_id": Number(post_id),
      },
    };

    try {
      const result = await dynamoDb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Error retrieving comments:", error);
      throw new Error("Could not retrieve comments");
    }
  },

  deleteComment: async (comment_id) => {
    const params = {
      TableName: COMMENT_TABLE,
      Key: { comment_id: comment_id },
    };

    try {
      await dynamoDb.delete(params).promise();
      return { message: "Comment deleted successfully" };
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw new Error("Could not delete comment");
    }
  },
};

module.exports = CommentModel;
