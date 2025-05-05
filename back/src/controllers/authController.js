const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { comparePassword } = require('../utils/passwordUtils');
const authConfig = require('../config/auth');

async function login(req, res) {
  try {
    const { credential, password } = req.body;

    if (!credential || !password) {
      return res.status(400).json({message: 'Username/email and password are required' });
    }

    const user = await User.findByCredential(credential);

    if (!user) {
      return res.status(401).json({message: 'INvalid credentials.' });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    
    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiration }
    );

    // Return user info and token
    return res.status(200).json({
      message: 'Login Successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login erro:' , error);
    return res.status(500).json({ message: 'Server error durin login' });
  }
}

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({message: 'Username, email and password are required' });
    }

    const userExists = await User.checkExists(email, username);

    if (userExists) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    const newUser = await User.create({
      username,
      email,
      password,
      role: 'user'
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id:newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiration }
    );

    return res.status(201).json({
      message: 'Registration Successful',
      user: {
        id:newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:' , error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
}

// Get current user profile
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error while getting profile:' , error);
    return res.status(500).json({message: 'Server error' });
  }
}

module.exports = {
  login,
  register,
  getProfile
}
