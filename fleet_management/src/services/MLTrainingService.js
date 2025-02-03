const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MLTrainingService {
  constructor() {
    this.modelData = null;
  }

  async preprocessData(data) {
    try {
      return data.map(route => ({
        features: {
          timeOfDay: route.timeOfDay,
          dayOfWeek: route.dayOfWeek,
          routeDistance: route.routeDistance,
          numberOfStops: route.numberOfStops,
          vehicleCapacity: route.vehicleCapacity
        },
        outcomes: {
          actualDuration: route.actualDuration,
          actualDistance: route.actualDistance,
          deliverySuccess: route.deliverySuccess,
          onTimeDelivery: route.onTimeDelivery
        }
      }));
    } catch (error) {
      console.error('Error preprocessing data:', error);
      throw error;
    }
  }

  calculateAverages(data) {
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
  }

  async trainModel() {
    try {
      const routeData = await prisma.mLRouteData.findMany();
      if (routeData.length < 5) {
        throw new Error('Insufficient data for training');
      }

      const processedData = await this.preprocessData(routeData);
      
      // Calculate average metrics
      this.modelData = {
        averageDuration: this.calculateAverages(processedData.map(d => d.outcomes.actualDuration)),
        averageDistance: this.calculateAverages(processedData.map(d => d.outcomes.actualDistance)),
        successRate: this.calculateAverages(processedData.map(d => d.outcomes.deliverySuccess ? 1 : 0)),
        onTimeRate: this.calculateAverages(processedData.map(d => d.outcomes.onTimeDelivery ? 1 : 0))
      };

      return {
        message: 'Model trained successfully',
        dataPoints: routeData.length
      };
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }

  async predict(routeFeatures) {
    try {
      if (!this.modelData) {
        await this.trainModel();
      }

      // Simple prediction based on averages and basic rules
      return {
        predictedDuration: this.modelData.averageDuration * 
          (1 + (routeFeatures.numberOfStops / 10)),
        predictedDistance: routeFeatures.routeDistance * 1.1,
        deliverySuccessProbability: this.modelData.successRate,
        onTimeDeliveryProbability: this.modelData.onTimeRate
      };
    } catch (error) {
      console.error('Error making prediction:', error);
      throw error;
    }
  }
}

module.exports = new MLTrainingService(); 