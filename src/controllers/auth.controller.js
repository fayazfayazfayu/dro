const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check if it's admin login
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
          { 
            userId: 'admin',
            email: process.env.ADMIN_EMAIL,
            isAdmin: true 
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({ token });
      }

      // Regular user login
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          isAdmin: false 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  register: async (req, res) => {
    try {
      const { email, password, firstName, lastName, licenseNumber, phoneNumber } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          licenseNumber,
          phoneNumber
        }
      });

      // Create token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          isAdmin: false 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = authController; 