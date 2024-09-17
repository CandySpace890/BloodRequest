const dynamoDb = require("../config/db");

const BLOOD_SAMPLE_TABLE = "blood_samples";

const BloodSampleModel = {
  getAllSamples: async () => {
    const params = {
      TableName: BLOOD_SAMPLE_TABLE,
    };

    try {
      const result = await dynamoDb.scan(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Unable to get blood samples. Error:", error);
      throw new Error("Error retrieving blood samples");
    }
  },

  getSampleByID: async (blood_sample_id) => {
    console.log("Blood Type ", blood_sample_id);
    // const params = {
    //   TableName: BLOOD_SAMPLE_TABLE,
    //   FilterExpression: "blood_sample_id = :blood_sample_id",
    //   ExpressionAttributeValues: {
    //     ":id": blood_sample_id,
    //   },
    // };
    const params = {
      TableName: BLOOD_SAMPLE_TABLE,
      Key: {
        id: Number(blood_sample_id),
      },
    };

    try {
      const result = await dynamoDb.scan(params).promise();
      return result.Items[0];
    } catch (error) {
      console.error("Unable to get blood sample. Error:", error);
      throw new Error("Error retrieving blood sample by type");
    }
  },

  updateSampleUnits: async (blood_sample_id, units) => {
    const params = {
      TableName: BLOOD_SAMPLE_TABLE,
      Key: { id: Number(blood_sample_id) },
      UpdateExpression: "SET units = :units",
      ExpressionAttributeValues: {
        ":units": units,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const result = await dynamoDb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error("Unable to update blood sample units. Error:", error);
      throw new Error("Error updating blood sample units");
    }
  },

  createBloodSample: async (blood_type, units) => {
    const id = Math.floor(Math.random() * 1000000);
    const params = {
      TableName: BLOOD_SAMPLE_TABLE,
      Item: {
        id,
        blood_type,
        units,
      },
    };

    try {
      await dynamoDb.put(params).promise();
      return { blood_type, units };
    } catch (error) {
      console.error("Unable to create blood sample. Error:", error);
      throw new Error("Error creating blood sample");
    }
  },

  deleteBloodSample: async (blood_sample_id) => {
    console.log("Blood Sample ID ", blood_sample_id);
    const params = {
      TableName: BLOOD_SAMPLE_TABLE,
      Key: { id: Number(blood_sample_id) },
    };

    try {
      await dynamoDb.delete(params).promise();
      return { message: "Blood sample deleted successfully" };
    } catch (error) {
      console.error("Unable to delete blood sample. Error:", error);
      throw new Error("Error deleting blood sample");
    }
  },
};

module.exports = BloodSampleModel;
