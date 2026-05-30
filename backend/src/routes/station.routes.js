const express = require('express');
const router = express.Router();
const stationController = require('../controllers/station.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Fetch all available SPBKLU Swap Stations (Public or User/Admin)
router.get('/', stationController.getAllStations);

// Fetch station slots & battery details by station ID
router.get('/:id', stationController.getStationDetail);

// Create a new station (Requires Login & Admin Role)
router.post('/', verifyToken, isAdmin, stationController.createStation);

module.exports = router;
