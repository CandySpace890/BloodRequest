const AlertModel = require('../models/alertModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;


const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.sendStatus(403);  
            }

            req.userId = user.userId;  
            next();
        });
    } else {
        res.sendStatus(401); 
    }
};
const createAlert = async (req, res) => {
    try {
        const alertData = req.body;
        await AlertModel.createAlert(alertData);
        res.status(201).json({ message: 'Alert created successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAlertById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await AlertModel.getAlertById(id);
        if (result.Item) {
            res.status(200).json(result.Item);
        } else {
            res.status(404).json({ message: 'Alert not found!' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const result = await AlertModel.updateAlert(id, updateData);
        res.status(200).json({ message: 'Alert updated successfully!', updatedAttributes: result.Attributes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        await AlertModel.deleteAlert(id);
        res.status(200).json({ message: 'Alert marked as inactive  successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllAlerts = async (req, res) => {
        console.log("In Get")
        const result = await AlertModel.getAllAlerts();
        res.status(200).json({ alerts: [...result.Items] });
    
};


const getAlertsByCountry = async (req, res) => {
    try {
        const { country } = req.params;
        const result = await AlertModel.getAlertsByCountry(country);
        res.status(200).json({ alerts: [...result.Items] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAlertsByState = async (req, res) => {
    try {
        const { state } = req.params;
        const result = await AlertModel.getAlertsByState(state);
        res.status(200).json({ alerts: [...result.Items] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAlertsByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const result = await AlertModel.getAlertsByCity(city);
        res.status(200).json({ alerts: [...result.Items] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAlertsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const result = await AlertModel.getAlertsByDate(date);
        res.status(200).json({ alerts: [...result.Items] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createAlert:[authenticateJWT,createAlert],
    getAlertById:[authenticateJWT,getAlertById],
    updateAlert:[authenticateJWT,updateAlert],
    deleteAlert:[authenticateJWT,deleteAlert],
    getAllAlerts:[authenticateJWT,getAllAlerts],
    getAlertsByCountry:[authenticateJWT,getAlertsByCountry],
    getAlertsByState:[authenticateJWT,getAlertsByState],
    getAlertsByCity:[authenticateJWT,getAlertsByCity],
    getAlertsByDate:[authenticateJWT,getAlertsByDate]
};
