const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({message: 'Access denied. No token was provided.' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {    
    return res.status(401).json({message: 'INvalid token format.' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:' , error.message);
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

module.exports = {verifyToken};
