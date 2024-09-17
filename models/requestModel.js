const dynamoDb = require("../config/db");

const REQUEST_TABLE = "approval_requests";

const RequestModel = {
  createRequest: async (requestType, units, userId) => {
    const requestId = Math.floor(Math.random() * 1000000);
    const params = {
      TableName: REQUEST_TABLE,
      Item: {
        requestId,
        units,
        requestType,
        status: "pending", // Initial status
        date: new Date().toISOString(),
        userId,
        userName,
        disease,
        dob,
        units,
        blood_group,
        reviewedBy: null, // Reviewed by admin when status changes
      },
    };

    try {
      await dynamoDb.put(params).promise();
      return { requestId, requestType, status: "pending", userId };
    } catch (error) {
      console.error("Unable to create approval request. Error:", error);
      throw new Error("Error creating approval request");
    }
  },

  getRequestsByUser: async (userId, requestType) => {
    const params = {
      TableName: REQUEST_TABLE,
      FilterExpression: "userId = :userId AND requestType = :requestType",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":requestType": requestType,
      },
    };

    try {
      const result = await dynamoDb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Unable to get approval requests. Error:", error);
      throw new Error("Error fetching approval requests");
    }
  },

  getAllRequests: async () => {
    const params = {
      TableName: REQUEST_TABLE,
    };

    try {
      const result = await dynamoDb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Unable to get all approval requests. Error:", error);
      throw new Error("Error fetching all approval requests");
    }
  },

  updateRequestStatus: async (requestId, status, reviewedBy) => {
    const params = {
      TableName: REQUEST_TABLE,
      Key: { requestId },
      UpdateExpression: "SET status = :status, reviewedBy = :reviewedBy",
      ExpressionAttributeValues: {
        ":status": status,
        ":reviewedBy": reviewedBy,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const result = await dynamoDb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error("Unable to update approval request. Error:", error);
      throw new Error("Error updating approval request");
    }
  },

  deleteRequest: async (requestId) => {
    const params = {
      TableName: REQUEST_TABLE,
      Key: { requestId },
    };

    try {
      await dynamoDb.delete(params).promise();
      return { message: "Approval request deleted successfully" };
    } catch (error) {
      console.error("Unable to delete approval request. Error:", error);
      throw new Error("Error deleting approval request");
    }
  },
};

module.exports = RequestModel;
