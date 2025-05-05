const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth')

// Compare provided password with the hashed one in database
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Hash passwords
async function hashPassword(password) {
  return await bcrypt.hash(password,  authConfig.saltRounds);
}

module.exports = {
  comparePassword,
  hashPassword
} 
