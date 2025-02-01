const roleMiddleware = {
  isAdmin: (req, res, next) => {
    try {
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Check if user is accessing their own resources or is admin
  isSelfOrAdmin: (req, res, next) => {
    try {
      const requestedUserId = req.params.id;
      if (!req.user || (req.user.userId !== requestedUserId && !req.user.isAdmin)) {
        return res.status(403).json({ message: 'Access denied. Unauthorized.' });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = roleMiddleware; 