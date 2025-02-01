const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          licenseNumber: true,
          isActive: true
        }
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const requestingUserId = req.user.userId;
      
      if (id !== requestingUserId && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          licenseNumber: true,
          isActive: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, phoneNumber, password } = req.body;
      
      const updateData = {
        firstName,
        lastName,
        phoneNumber,
        ...(password && { password: await bcrypt.hash(password, 10) })
      };

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          licenseNumber: true,
          isActive: true
        }
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id }
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = userController; 