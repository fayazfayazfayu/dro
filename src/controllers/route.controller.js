const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const routeController = {
  getRoutes: async (req, res) => {
    try {
      const userId = req.user.userId;
      const isAdmin = req.user.isAdmin;

      const routes = await prisma.route.findMany({
        where: isAdmin ? {} : { userId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              registrationNumber: true,
              model: true
            }
          }
        }
      });

      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  getRouteById: async (req, res) => {
    try {
      const { id } = req.params;
      const route = await prisma.route.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              registrationNumber: true,
              model: true
            }
          }
        }
      });

      if (!route) {
        return res.status(404).json({ message: 'Route not found' });
      }

      res.json(route);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  createRoute: async (req, res) => {
    try {
      const { name, startPoint, endPoint, distance, duration, userId, vehicleId } = req.body;

      const route = await prisma.route.create({
        data: {
          name,
          startPoint,
          endPoint,
          distance,
          duration,
          userId,
          vehicleId
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              registrationNumber: true,
              model: true
            }
          }
        }
      });

      res.status(201).json(route);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  updateRoute: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, startPoint, endPoint, distance, duration } = req.body;

      const route = await prisma.route.update({
        where: { id },
        data: {
          name,
          startPoint,
          endPoint,
          distance,
          duration
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              registrationNumber: true,
              model: true
            }
          }
        }
      });

      res.json(route);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  deleteRoute: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.route.delete({
        where: { id }
      });

      res.json({ message: 'Route deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  updateRouteStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;
      const isAdmin = req.user.isAdmin;

      const route = await prisma.route.findUnique({
        where: { id }
      });

      if (!route) {
        return res.status(404).json({ message: 'Route not found' });
      }

      if (!isAdmin && route.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const updatedRoute = await prisma.route.update({
        where: { id },
        data: { status },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              registrationNumber: true,
              model: true
            }
          }
        }
      });

      res.json(updatedRoute);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  assignRoute: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, vehicleId } = req.body;

      const route = await prisma.route.update({
        where: { id },
        data: { 
          userId,
          vehicleId
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              registrationNumber: true,
              model: true
            }
          }
        }
      });

      res.json(route);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = routeController; 