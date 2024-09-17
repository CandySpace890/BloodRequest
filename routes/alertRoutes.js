const express = require('express');
const {
    createAlert,
    getAlertById,
    updateAlert,
    deleteAlert,
    getAllAlerts,
    getAlertsByCountry,
    getAlertsByState,
    getAlertsByCity,
    getAlertsByDate
} = require('../controllers/alertController');

const router = express.Router();

router.post('/createAlert', createAlert);
router.get('/getAllAlerts', getAllAlerts);

router.get('getAlertById/:id', getAlertById);

router.post('updateAlert/:id', updateAlert);
router.get('deleteAlert/:id', deleteAlert);



router.get('/country/:country', getAlertsByCountry);

router.get('/state/:state', getAlertsByState);

router.get('/city/:city', getAlertsByCity);

router.get('/date/:date', getAlertsByDate);

module.exports = router;
