const AWS = require('aws-sdk');
const dynamoDB = require('../config/db');

const ALERT_TABLE = 'alerts';

const AlertModel = {
    createAlert: async (alertData) => {
        const currentDateTime = new Date();
        const date = currentDateTime.toISOString().split('T')[0]; 
        const time = currentDateTime.toTimeString().split(' ')[0];
        const isActive = 1;
        const id = Math.floor(Math.random() * 1000000); 
        const params = {
            TableName: ALERT_TABLE,
            Item: {
                id: id,
                alert_description: alertData.alert_description,
                alert_title: alertData.alert_title,
                created_by: alertData.created_by,
                disaster_type: alertData.disaster_type,
                location: alertData.location,
                severity: alertData.severity,
                country: alertData.country,
                state: alertData.state,
                city: alertData.city,
                date: date,  
                time: time ,
                isActive:isActive   
            },
        };
        return await dynamoDB.put(params).promise();
    },

    getAlertById: async (id) => {
        const params = {
            TableName: ALERT_TABLE,
            Key: {
                id: Number(id),
            },
        };
        return await dynamoDB.get(params).promise();
    },

    updateAlert: async (id, updateData) => {
        let updateExpression = 'set ';
        let expressionAttributeValues = {};
        let expressionAttributeNames = {};
        
        Object.keys(updateData).forEach((key, index) => {
            const attributeName = `#field${index}`;
            const attributeValue = `:value${index}`;
            
            updateExpression += `${attributeName} = ${attributeValue}, `;
            expressionAttributeValues[attributeValue] = updateData[key];
            expressionAttributeNames[attributeName] = key;
        });
        
        updateExpression = updateExpression.slice(0, -2);
    
        const params = {
            TableName: ALERT_TABLE,
            Key: { id:Number(id) },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: "UPDATED_NEW",
        };
    
        return await dynamoDB.update(params).promise();
    },
    

    deleteAlert: async (id) => {
        const params = {
            TableName: ALERT_TABLE,
            Key: { id:Number(id) },
            UpdateExpression: "set isActive = :isActive",
            ExpressionAttributeValues: {
                ":isActive": 0, 
            },
            ReturnValues: "UPDATED_NEW"
        };
        return await dynamoDB.update(params).promise();
    },

    getAllAlerts: async () => {
        try {
            const params = {
                TableName: ALERT_TABLE,
                FilterExpression: 'isActive = :isActiveValue',
                ExpressionAttributeValues: {
                    ':isActiveValue': 1 
                }
            };
            console.log('Scan params:', JSON.stringify(params, null, 2));
            const result = await dynamoDB.scan(params).promise();
            return result;
        } catch (error) {
            console.error('Error scanning DynamoDB:', error);
            throw error;
        }
    },


    getAlertsByCountry: async (country) => {
        const params = {
            TableName: ALERT_TABLE,
            FilterExpression: 'country = :country',
            ExpressionAttributeValues: {
                ':country': country,
            },
        };
        return await dynamoDB.scan(params).promise();
    },

    getAlertsByState: async (state) => {
        const params = {
            TableName: ALERT_TABLE,
            FilterExpression: 'state = :state',
            ExpressionAttributeValues: {
                ':state': state,
            },
        };
        return await dynamoDB.scan(params).promise();
    },

    getAlertsByCity: async (city) => {
        const params = {
            TableName: ALERT_TABLE,
            FilterExpression: 'city = :city',
            ExpressionAttributeValues: {
                ':city': city,
            },
        };
        return await dynamoDB.scan(params).promise();
    },
    getAlertsByDate: async (date) => {
        const params = {
            TableName: ALERT_TABLE,
            FilterExpression: '#alertDate = :date',
            ExpressionAttributeNames: {
                '#alertDate': 'date',  // Aliasing the reserved keyword
            },
            ExpressionAttributeValues: {
                ':date': date,
            },
        };
        return await dynamoDB.scan(params).promise();
    },
    
    
};

module.exports = AlertModel;
