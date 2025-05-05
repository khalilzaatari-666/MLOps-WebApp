const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser, updateUserRole } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.get('/' , verifyToken , requireAdmin, getAllUsers);
router.post('/' , verifyToken, requireAdmin, createUser);
router.delete('/:id' , verifyToken, requireAdmin, deleteUser);
router.patch('/:id/role', verifyToken, requireAdmin, updateUserRole);

module.exports = router;
