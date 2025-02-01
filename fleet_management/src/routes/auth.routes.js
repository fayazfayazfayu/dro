const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateUser } = require('../middleware/validation.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Public routes
router.post('/login', authController.login);

// Admin only routes
router.post('/register', authMiddleware, roleMiddleware.isAdmin, validateUser, authController.register);

module.exports = router; 