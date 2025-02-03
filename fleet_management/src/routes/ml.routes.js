const express = require('express');
const router = express.Router();
const mlController = require('../controllers/ml.controller');
const authMiddleware = require('../middleware/auth.middleware');

// ML routes with auth middleware
router.get('/data-availability', authMiddleware, mlController.checkDataAvailability);
router.post('/predict', authMiddleware, mlController.predictRoute);
router.get('/training-data', authMiddleware, mlController.getTrainingData);

module.exports = router;