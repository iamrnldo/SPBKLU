const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isUser } = require('../middlewares/auth.middleware');

// Fetch current user profile (Requires Login)
router.get('/profile', verifyToken, userController.getProfile);

// Top up wallet balance (Requires Login & Regular User Role)
router.post('/topup', verifyToken, isUser, userController.topUpBalance);

module.exports = router;
