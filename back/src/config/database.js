const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnection: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database with required tables
async function initDatabase() {
  try {
    const connection = await pool.getConnection();

    // Created datas table if it doesnt exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS datas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Check if admin user exists,and create default admin if it doesnt exist
    const [adminExists] = await connection.execute(
      'SELECT COUNT(*) as count from datas where role = ?', ['admin']
    );

    if (adminExists[0].count === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin' , 10);

      await connection.execute(
        'insert into datas (username, email, password, role) values (?,?,?,?)', ['admin', 'admin@pcs-agri.com', hashedPassword, 'admin']
      );

      console.log('Default admin user created');
    }

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:' , error);
    process.exit(1);
  }
}

module.exports = {
  pool,
  initDatabase
}


