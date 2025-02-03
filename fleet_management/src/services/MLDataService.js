const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MLDataService {
  async collectRouteData(routeId) {
    try {
      // Get route details with all related data
      const route = await prisma.route.findUnique({
        where: { id: routeId },
        include: {
          routeHistory: {
            include: {
              trafficData: true,
              deliveryOutcome: true
            }
          }
        }
      });

      if (!route) {
        throw new Error('Route not found');
      }

      // Extract ML features
      const mlRouteData = await prisma.mLRouteData.create({
        data: {
          routeId: route.id,
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          routeDistance: route.distance,
          numberOfStops: route.waypoints ? JSON.parse(route.waypoints).length : 0,
          vehicleCapacity: route.vehicle ? route.vehicle.capacity : 0,
          actualDuration: route.routeHistory[0]?.actualDuration || 0,
          actualDistance: route.routeHistory[0]?.actualDistance || 0,
          deliverySuccess: route.routeHistory[0]?.deliveryOutcome?.success || false,
          onTimeDelivery: route.routeHistory[0]?.deliveryOutcome?.onTime || false,
        }
      });

      return mlRouteData;
    } catch (error) {
      console.error('Error collecting ML data:', error);
      throw error;
    }
  }

  async getMLDataset() {
    try {
      return await prisma.mLRouteData.findMany({
        include: {
          trafficFeatures: true
        }
      });
    } catch (error) {
      console.error('Error fetching ML dataset:', error);
      throw error;
    }
  }

  async checkDataAvailability() {
    try {
      // Count records in each relevant table
      const counts = await prisma.$transaction([
        prisma.routeHistory.count(),
        prisma.trafficData.count(),
        prisma.deliveryOutcome.count(),
        prisma.mLRouteData.count()
      ]);

      return {
        routeHistoryCount: counts[0],
        trafficDataCount: counts[1],
        deliveryOutcomeCount: counts[2],
        mlRouteDataCount: counts[3]
      };
    } catch (error) {
      console.error('Error checking data availability:', error);
      throw error;
    }
  }

  async getTrainingData() {
    try {
      const trainingData = await prisma.routeHistory.findMany({
        include: {
          trafficData: true,
          deliveryOutcome: true,
          route: {
            include: {
              vehicle: true
            }
          }
        }
      });

      console.log(`Found ${trainingData.length} training records`);
      return trainingData;
    } catch (error) {
      console.error('Error fetching training data:', error);
      throw error;
    }
  }
}

module.exports = new MLDataService(); 