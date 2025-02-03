const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // First, ensure we have some routes to reference
  const routeHistories = await prisma.routeHistory.createMany({
    data: [
      {
        routeId: "route1", // assuming this route ID exists
        actualDistance: 4.84,
        actualDuration: 45,
        startTime: new Date('2024-03-15T09:00:00Z'),
        endTime: new Date('2024-03-15T09:45:00Z'),
        numberOfStops: 1,
      },
      {
        routeId: "route1",
        actualDistance: 4.84,
        actualDuration: 52,
        startTime: new Date('2024-03-15T14:00:00Z'),
        endTime: new Date('2024-03-15T14:52:00Z'),
        numberOfStops: 1,
      },
      {
        routeId: "route1",
        actualDistance: 4.90,
        actualDuration: 48,
        startTime: new Date('2024-03-16T10:00:00Z'),
        endTime: new Date('2024-03-16T10:48:00Z'),
        numberOfStops: 1,
      }
    ]
  });

  // Get the created route histories
  const histories = await prisma.routeHistory.findMany();

  // Add traffic data for each route history
  for (const history of histories) {
    await prisma.trafficData.createMany({
      data: [
        {
          routeHistoryId: history.id,
          congestionLevel: "LOW",
          averageSpeed: 35,
          location: { lat: 12.9716, lon: 77.5946 }, // Bangalore coordinates
          timestamp: new Date(history.startTime.getTime() + 5 * 60000) // 5 mins after start
        },
        {
          routeHistoryId: history.id,
          congestionLevel: "MEDIUM",
          averageSpeed: 25,
          location: { lat: 12.9717, lon: 77.5947 },
          timestamp: new Date(history.startTime.getTime() + 15 * 60000) // 15 mins after start
        },
        {
          routeHistoryId: history.id,
          congestionLevel: "LOW",
          averageSpeed: 30,
          location: { lat: 12.9718, lon: 77.5948 },
          timestamp: new Date(history.startTime.getTime() + 30 * 60000) // 30 mins after start
        }
      ]
    });

    // Add delivery outcome for each route history
    await prisma.deliveryOutcome.create({
      data: {
        routeHistoryId: history.id,
        onTime: Math.random() > 0.3, // 70% chance of being on time
        delayMinutes: Math.floor(Math.random() * 15), // 0-15 minutes delay
        success: Math.random() > 0.1, // 90% success rate
        notes: Math.random() > 0.5 ? "Traffic caused slight delay" : null
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 