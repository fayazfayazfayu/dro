const MLDataService = require('../services/MLDataService');
const MLTrainingService = require('../services/MLTrainingService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mlController = {
  collectRouteData: async (req, res) => {
    try {
      const { routeId } = req.params;
      const mlData = await MLDataService.collectRouteData(routeId);
      res.json(mlData);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  getMLDataset: async (req, res) => {
    try {
      const dataset = await MLDataService.getMLDataset();
      res.json(dataset);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  checkDataAvailability: async (req, res) => {
    try {
      // Simple counts from database
      const counts = await prisma.$transaction([
        prisma.route.count(),
        prisma.routeHistory.count(),
        prisma.trafficData.count(),
        prisma.deliveryOutcome.count()
      ]);

      res.json({
        routeCount: counts[0],
        routeHistoryCount: counts[1],
        trafficDataCount: counts[2],
        deliveryOutcomeCount: counts[3],
        mlRouteDataCount: 0  // Since ML data table isn't created yet
      });
    } catch (error) {
      console.error('Data availability check failed:', error);
      res.status(500).json({ 
        message: 'Error checking data availability',
        error: error.message 
      });
    }
  },

  predictRoute: async (req, res) => {
    try {
      const routeFeatures = req.body;
      
      // Simple prediction based on route features
      const prediction = {
        predictedDuration: routeFeatures.routeDistance * 2, // Simple estimation
        predictedDistance: routeFeatures.routeDistance * 1.1,
        deliverySuccessProbability: 0.85,
        onTimeDeliveryProbability: 0.75
      };

      res.json({ prediction });
    } catch (error) {
      console.error('Route prediction failed:', error);
      res.status(500).json({ 
        message: 'Error making prediction',
        error: error.message 
      });
    }
  },

  getTrainingData: async (req, res) => {
    try {
      const trainingData = await prisma.route.findMany({
        include: {
          routeHistory: {
            include: {
              trafficData: true,
              deliveryOutcome: true
            }
          }
        }
      });

      res.json(trainingData);
    } catch (error) {
      console.error('Error fetching training data:', error);
      res.status(500).json({ 
        message: 'Error fetching training data',
        error: error.message 
      });
    }
  }
};

module.exports = mlController; 