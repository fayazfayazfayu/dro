const MLTrainingService = require('../services/MLTrainingService');

const mlTrainingController = {
  trainModel: async (req, res) => {
    try {
      const result = await MLTrainingService.trainModel();
      res.json({
        success: true,
        message: 'Model trained successfully',
        details: result
      });
    } catch (error) {
      console.error('Training error:', error);
      res.status(500).json({
        success: false,
        message: 'Model training failed',
        error: error.message
      });
    }
  },

  predict: async (req, res) => {
    try {
      const routeFeatures = req.body;
      const prediction = await MLTrainingService.predict(routeFeatures);
      res.json({
        success: true,
        prediction
      });
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({
        success: false,
        message: 'Prediction failed',
        error: error.message
      });
    }
  }
};

module.exports = mlTrainingController; 