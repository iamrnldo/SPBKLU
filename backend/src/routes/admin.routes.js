const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Get statistics / metrics / dashboard charts (Requires Login & Admin Role)
router.get('/dashboard-stats', verifyToken, isAdmin, adminController.getDashboardStats);

// List all users in the system (Requires Login & Admin Role)
router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);

// Top up user balance (Requires Login & Admin Role)
router.post('/users/:id/topup', verifyToken, isAdmin, adminController.topUpUser);

module.exports = router;
