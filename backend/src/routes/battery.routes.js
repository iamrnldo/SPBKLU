const express = require('express');
const router = express.Router();
const batteryController = require('../controllers/battery.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Get all batteries (Requires Login & Admin Role)
router.get('/', verifyToken, isAdmin, batteryController.getAllBatteries);

// Get battery health diagnostics or details by ID
router.get('/:id', verifyToken, batteryController.getBatteryDetail);

// Register a new battery to the system (Requires Login & Admin Role)
router.post('/', verifyToken, isAdmin, batteryController.createBattery);

module.exports = router;
