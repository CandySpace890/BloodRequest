const dynamoDb = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const POST_TABLE = "posts";

const PostModel = {
  createPost: async (postData) => {
    const {
      description,
      disaster_type,
      status,
      title,
      user_id,
      location,
      attachment_link,
    } = postData;

    const id = Math.floor(Math.random() * 1000000); // Simple random number generator for id

    const params = {
      TableName: POST_TABLE,
      Item: {
        id,
        description,
        disaster_type,
        status,
        title,
        user_id,
        location,
        attachment_link,
      },
    };
    console.log("params******", params);

    await dynamoDb.put(params).promise();

    // Return created post details (without S3UploadUrl since it's not generated anymore)
    return {
      id,
      description,
      disaster_type,
      status,
      title,
      user_id,
      location,
      attachment_link, // Still returning empty until front-end uploads
    };
  },
  getPostById: async (id) => {
    const params = {
      TableName: POST_TABLE,
      Key: {
        id: Number(id),
      },
    };

    try {
      const result = await dynamoDb.get(params).promise();

      if (!result.Item) {
        throw new Error("Post not found");
      }

      const post = result.Item;
      const signedUrlExpireSeconds = 60 * 5; // URL expires in 5 minutes
      let signedUrl = null;

      if (post.attachment_link) {
        try {
          signedUrl = s3.getSignedUrl("getObject", {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: post.attachment_link,
            Expires: signedUrlExpireSeconds,
          });
        } catch (error) {
          console.error(
            `Error generating signed URL for post ID ${id}:`,
            error.message
          );
        }
      }

      return {
        ...post,
        signedUrl, // Include signed URL in the response
      };
    } catch (error) {
      console.error("Error retrieving post:", error);
      throw new Error("Could not retrieve post");
    }
  },

  getAllPosts: async () => {
    const params = {
      TableName: POST_TABLE,
    };

    try {
      const result = await dynamoDb.scan(params).promise();
      const posts = result.Items;

      const signedUrlExpireSeconds = 60 * 5;

      const postsWithSignedUrls = await Promise.all(
        posts.map(async (post) => {
          console.log("inside map");
          let signedUrl = null;
          if (post.attachment_link) {
            console.log("Inside");
            try {
              signedUrl = s3.getSignedUrl("getObject", {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: post.attachment_link,
                Expires: signedUrlExpireSeconds,
              });
            } catch (error) {
              console.error(
                `Error generating signed URL for post ID ${post.id}:`,
                error.message
              );
            }
          }

          return {
            ...post,
            signedUrl,
          };
        })
      );

      return postsWithSignedUrls;
    } catch (error) {
      console.error("Error retrieving posts:", error);
      throw new Error("Could not retrieve posts");
    }
  },
  updatePost: async (id, updateData) => {
    let updateExpression = "set";
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        const attributeKey = `#${key}`;
        const valueKey = `:${key}`;

        updateExpression += ` ${attributeKey} = ${valueKey},`;
        ExpressionAttributeNames[attributeKey] = key;
        ExpressionAttributeValues[valueKey] = updateData[key];
      }
    });

    updateExpression = updateExpression.slice(0, -1);

    if (updateExpression === "set") {
      throw new Error("No valid fields provided to update");
    }

    const params = {
      TableName: POST_TABLE,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(params).promise();

    return result.Attributes;
  },

  deletePost: async (id) => {
    const params = {
      TableName: POST_TABLE,
      Key: { id: Number(id) },
    };

    try {
      await dynamoDb.delete(params).promise();
      return { message: "Post deleted successfully" };
    } catch (error) {
      console.error("Error deleting post:", error);
      throw new Error("Could not delete post");
    }
  },
};

module.exports = PostModel;
