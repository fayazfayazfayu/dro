const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const vehicleController = {
  getVehicles: async (req, res) => {
    try {
      const userId = req.user.userId;
      const isAdmin = req.user.isAdmin;

      const vehicles = await prisma.vehicle.findMany({
        where: isAdmin ? {} : { userId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  getVehicleById: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  createVehicle: async (req, res) => {
    try {
      const { registrationNumber, model, capacity, fuelType } = req.body;

      const vehicle = await prisma.vehicle.create({
        data: {
          registrationNumber,
          model,
          capacity,
          fuelType
        }
      });

      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  updateVehicle: async (req, res) => {
    try {
      const { id } = req.params;
      const { registrationNumber, model, capacity, fuelType } = req.body;

      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: {
          registrationNumber,
          model,
          capacity,
          fuelType
        }
      });

      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  deleteVehicle: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.vehicle.delete({
        where: { id }
      });

      res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  assignVehicle: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: { userId }
      });

      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  unassignVehicle: async (req, res) => {
    try {
      const { id } = req.params;

      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: { userId: null }
      });

      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = vehicleController; 