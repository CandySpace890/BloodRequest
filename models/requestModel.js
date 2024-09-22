const dynamoDb = require("../config/db");

const REQUEST_TABLE = "approval_requests";

const RequestModel = {
  createRequest: async (
    requestType,
    userId,
    userName,
    disease,
    dob,
    units,
    bloodGroup,
    bloodSampleId
  ) => {
    const requestId = Math.floor(Math.random() * 1000000); // Generate a random request ID
    console.log("Blood Sample Id:", bloodSampleId);
    const params = {
      TableName: REQUEST_TABLE,
      Item: {
        requestId,
        requestType,
        approval_request_status: "pending", // Initial status set to pending
        date: new Date().toISOString(),
        userId,
        userName,
        disease,
        dob,
        units,
        bloodGroup,
        bloodSampleId,
        reviewedBy: null, // This will be set when the request is reviewed by an admin
      },
    };

    try {
      await dynamoDb.put(params).promise(); // Store the request in the DynamoDB table
      return {
        requestId,
        requestType,
        approval_request_status: "pending",
        userId,
        disease,
        dob,
        units,
        bloodGroup,
        bloodSampleId,
      };
    } catch (error) {
      console.error("Unable to create approval request. Error:", error);
      throw new Error("Error creating approval request");
    }
  },

  getRequestsByUser: async (userId, requestType, approval_request_status) => {
    console.log(
      "user id",
      userId,
      "request type",
      requestType,
      "approval request status",
      approval_request_status
    );

    const params = {
      TableName: REQUEST_TABLE,
      FilterExpression: "userId = :userId AND requestType = :requestType",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":requestType": requestType,
      },
    };

    // Add the approval_request_status to the filter if provided
    if (approval_request_status) {
      params.FilterExpression +=
        " AND approval_request_status = :approval_request_status";
      params.ExpressionAttributeValues[":approval_request_status"] =
        approval_request_status;
    }

    try {
      const result = await dynamoDb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Unable to get approval requests. Error:", error);
      throw new Error("Error fetching approval requests");
    }
  },

  getAllRequests: async (statusFilter, requestType) => {
    const params = {
      TableName: REQUEST_TABLE,
    };

    // Build the filter expression based on the provided filters
    let filterExpressions = [];
    let expressionAttributeValues = {};

    // Handle the approval_request_status filter (IN query)
    if (statusFilter && statusFilter.length > 0) {
      // Dynamically build the filter for the status IN query
      const statusKeys = statusFilter.map((_, index) => `:status_${index}`);
      filterExpressions.push(
        `approval_request_status IN (${statusKeys.join(", ")})`
      );

      // Add values for each status
      statusFilter.forEach((status, index) => {
        expressionAttributeValues[`:status_${index}`] = status;
      });
    }

    // Handle the requestType filter (exact match)
    if (requestType) {
      filterExpressions.push("requestType = :requestType");
      expressionAttributeValues[":requestType"] = requestType;
    }

    // If there are any filters, add them to the params
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(" AND ");
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    try {
      const result = await dynamoDb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Unable to get all approval requests. Error:", error);
      throw new Error("Error fetching all approval requests");
    }
  },

  updateRequestStatus: async (
    requestId,
    approval_request_status,
    reviewedBy
  ) => {
    console.log("Request Id", requestId);
    const params = {
      TableName: REQUEST_TABLE,
      Key: { requestId: Number(requestId) },
      UpdateExpression:
        "SET approval_request_status = :approval_request_status, reviewedBy = :reviewedBy",
      ExpressionAttributeValues: {
        ":approval_request_status": approval_request_status,
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
