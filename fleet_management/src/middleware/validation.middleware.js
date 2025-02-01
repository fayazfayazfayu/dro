const validationMiddleware = {
  validateUser: (req, res, next) => {
    const { email, password, firstName, lastName, licenseNumber } = req.body;
    
    if (!email || !password || !firstName || !lastName || !licenseNumber) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName', 'licenseNumber']
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    next();
  },

  validateVehicle: (req, res, next) => {
    const { registrationNumber, model, capacity, fuelType } = req.body;
    
    if (!registrationNumber || !model || !capacity || !fuelType) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['registrationNumber', 'model', 'capacity', 'fuelType']
      });
    }

    // Validate capacity is a positive number
    if (isNaN(capacity) || capacity <= 0) {
      return res.status(400).json({ message: 'Capacity must be a positive number' });
    }

    next();
  },

  validateRoute: (req, res, next) => {
    const { name, startPoint, endPoint, distance, duration } = req.body;
    
    if (!name || !startPoint || !endPoint || !distance || !duration) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'startPoint', 'endPoint', 'distance', 'duration']
      });
    }

    // Validate distance and duration are positive numbers
    if (isNaN(distance) || distance <= 0) {
      return res.status(400).json({ message: 'Distance must be a positive number' });
    }

    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    next();
  }
};

module.exports = validationMiddleware; 