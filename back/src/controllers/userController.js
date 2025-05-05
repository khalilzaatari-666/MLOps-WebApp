const User = require('../models/userModel');

// Get all users (admin)
async function getAllUsers(req, res) {
  try {
    const users = await User.findAll();
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error getting all users:' , error);
    return res.status(500).json({message: 'Server error while fetching users.' });
  }
}

// Create a new user (admin)
async function createUser(req, res) {
  try {
    const {username, email, password, role} = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({message: 'Username, email and password are required.' });
    }
    const userExists = await User.checkExists(email, username);

    if (userExists) {
      return res.status(409).json({ message: 'User with this username or email already exists.' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Creating user error:' , error);
    return res.status(500).json({ message: 'Server error while creating new user.' });
  }
}

// Delete user (admin)
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Not letting admin delete itself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    const deleted = await User.deleteById(id);

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Deleting user error:' , error);
    return res.status(500).json({ message: 'Server error while deleting user' });
  }
}

// Update user role (admin)
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user' , 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required.' });
    }

    // Not letting admin change their role
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your role' });
    }

    const updated = await User.updateRole(id, role);

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({message: 'User role updated successfully' });
  } catch (error) {
    console.error('Updating user role error:' , error);
    return res.status(500).json({ message: 'Server error while updating user role' });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  deleteUser,
  updateUserRole
}
