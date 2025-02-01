const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { validateRoute } = require('../middleware/validation.middleware');

// Get routes
router.get('/', authMiddleware, routeController.getRoutes);
router.get('/:id', authMiddleware, routeController.getRouteById);

// Admin only routes
router.post('/', authMiddleware, roleMiddleware.isAdmin, validateRoute, routeController.createRoute);
router.put('/:id', authMiddleware, roleMiddleware.isAdmin, validateRoute, routeController.updateRoute);
router.delete('/:id', authMiddleware, roleMiddleware.isAdmin, routeController.deleteRoute);

// Route status updates (accessible by assigned driver or admin)
router.patch('/:id/status', authMiddleware, routeController.updateRouteStatus);

// Assign route to driver (admin only)
router.patch('/:id/assign', authMiddleware, roleMiddleware.isAdmin, routeController.assignRoute);

module.exports = router; 