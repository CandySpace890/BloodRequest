const dynamoDb = require("../config/db");

const USER_TABLE = "users";

const UserModel = {
  createUser: async (userData) => {
    const {
      email,
      first_name,
      last_name,
      password,
      dob,
      blood_group,
      blood_sample_id,
    } = userData;

    const id = Math.floor(Math.random() * 1000000);
    const active = true;
    const userType = "user";
    const params = {
      TableName: USER_TABLE,
      Item: {
        id,
        email,
        first_name,
        last_name,
        password,
        active,
        userType,
        dob,
        blood_group,
        blood_sample_id,
      },
    };

    await dynamoDb.put(params).promise();

    return {
      id,
      email,
      first_name,
      last_name,
      active,
      userType,
      dob,
      blood_group,
      blood_sample_id,
    };
  },

  getUserByEmail: async (email) => {
    const params = {
      TableName: USER_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };

    try {
      const result = await dynamoDb.scan(params).promise();
      return result.Items[0];
    } catch (error) {
      console.error("Unable to scan the table. Error:", error);
      throw new Error("Error retrieving user by email");
    }
  },

  getUserById: async (id) => {
    const params = {
      TableName: USER_TABLE,
      Key: { id },
    };

    try {
      const result = await dynamoDb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error("Unable to get user by ID. Error:", error);
      throw new Error("Error retrieving user by ID");
    }
  },

  updateUser: async (id, updateData) => {
    const updateExpression = [];
    const expressionAttributeValues = {};

    for (const key in updateData) {
      updateExpression.push(`${key} = :${key}`);
      expressionAttributeValues[`:${key}`] = updateData[key];
    }

    const params = {
      TableName: USER_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    try {
      const result = await dynamoDb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error("Unable to update user. Error:", error);
      throw new Error("Error updating user");
    }
  },

  deleteUser: async (id) => {
    const params = {
      TableName: USER_TABLE,
      Key: { id },
    };

    try {
      await dynamoDb.delete(params).promise();
      return { message: "User deleted successfully" };
    } catch (error) {
      console.error("Unable to delete user. Error:", error);
      throw new Error("Error deleting user");
    }
  },

  getAllUsers: async () => {
    const params = {
      TableName: USER_TABLE,
      FilterExpression: "userType = :userType",
      ExpressionAttributeValues: {
        ":userType": "user",
      },
    };

    try {
      const result = await dynamoDb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Unable to get all users. Error:", error);
      throw new Error("Error retrieving users");
    }
  },
};

module.exports = UserModel;
