const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { validateVehicle } = require('../middleware/validation.middleware');

// Get routes
router.get('/', authMiddleware, vehicleController.getVehicles);
router.get('/:id', authMiddleware, vehicleController.getVehicleById);

// Admin only routes
router.post('/', authMiddleware, roleMiddleware.isAdmin, validateVehicle, vehicleController.createVehicle);
router.put('/:id', authMiddleware, roleMiddleware.isAdmin, validateVehicle, vehicleController.updateVehicle);
router.delete('/:id', authMiddleware, roleMiddleware.isAdmin, vehicleController.deleteVehicle);

// Assign/Unassign vehicle to driver (admin only)
router.patch('/:id/assign', authMiddleware, roleMiddleware.isAdmin, vehicleController.assignVehicle);
router.patch('/:id/unassign', authMiddleware, roleMiddleware.isAdmin, vehicleController.unassignVehicle);

module.exports = router; 