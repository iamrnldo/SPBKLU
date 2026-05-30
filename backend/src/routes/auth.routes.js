const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register a regular user (Mobile APK)
router.post('/register', authController.registerUser);

// Login (All accounts: users and admin web)
router.post('/login', authController.login);

module.exports = router;
