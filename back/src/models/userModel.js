const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth');

class User {

  // Find user by username or email
  static async findByCredential(credential) {
    try {
      const [rows] = await pool.execute(
        'select * from datas where username = ? or email = ?', [credential, credential]
      );

      return rows[0];
    } catch (error) {
      console.error('Error finding user by credential:' , error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'select id, username, email, role, created_at from datas where id = ?' , [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:' , error);
      throw error;
    }
  }

    static async findByEmail(email) {
    const [user] = await pool.execute('SELECT * FROM datas WHERE email = ?', [email]);
    return user[0]; // returns user object or undefined
  }

  // Check if username exists
  static async findByUsername(username) {
    const [user] = await pool.execute('SELECT * FROM datas WHERE username = ?', [username]);
    return user[0]; // returns user object or undefined
  }

  // Create new user 
  static async create(userData) {
    try {
      const { username, email, password, role='user'} = userData;
      const hashedPassword = await bcrypt.hash(password, authConfig.saltRounds);

      const [result] = await pool.execute(
        'insert into datas (username, email, password, role) values (? , ? , ? , ?)', [username, email, hashedPassword, role]
      );

      return {
        id: result.insertId,
        username,
        email,
        role
      };
    } catch (error) {
      console.error('Erorr creating user:' , error);
      throw error;
    }
  }

  // Get all users
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'select id, username, email, role, created_at from datas'
      );

      return rows;
    } catch (error) {
      console.error('Error finding all users:' , error);
      throw error;
    }
  }

  // Delete user by ID
  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'delete from datas where id = ?', [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:' , error);
      throw error;
    }
  }

  // Update user role
  static async updateRole(id, role) {
    try {
      const [result] = await pool.execute(
        'update datas set role = ? where id = ?' , [role , id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user role:' , error);
      throw error;
    }
  }

  // CHeck if email already exists
  static async checkExists(email, username) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM datas WHERE email = ? OR username = ?',
        [email, username]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }
}

module.exports = User;
