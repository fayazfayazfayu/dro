const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { validateUser } = require('../middleware/validation.middleware');

// Admin routes
router.get('/', authMiddleware, roleMiddleware.isAdmin, userController.getAllUsers);

// User routes
router.get('/:id', authMiddleware, roleMiddleware.isSelfOrAdmin, userController.getUserProfile);
router.put('/:id', authMiddleware, roleMiddleware.isSelfOrAdmin, validateUser, userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware.isAdmin, userController.deleteUser);

// Add route to update user status (Admin only)
router.patch('/:id/status', authMiddleware, roleMiddleware.isAdmin, userController.updateUserStatus);

module.exports = router;
