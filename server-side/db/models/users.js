const bcrypt = require('bcrypt');
const { pool } = require('../index');

const SALT_ROUNDS = 10;

// Register a new user
async function register(username, email, password) {
  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, created_at`,
      [username, email, passwordHash]
    );
    
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint === 'users_username_key') {
        throw new Error('Username already exists');
      }
      if (error.constraint === 'users_email_key') {
        throw new Error('Email already exists');
      }
    }
    throw error;
  }
}

// Login user
async function login(usernameOrEmail, password) {
  try {
    const result = await pool.query(
      `SELECT id, username, email, password_hash, role, created_at
       FROM users
       WHERE username = $1 OR email = $1`,
      [usernameOrEmail]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Don't return password hash
    delete user.password_hash;
    return user;
  } catch (error) {
    throw error;
  }
}

// Get user by ID
async function getUserById(id) {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// Get all users
async function getAllUsers() {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    
    return result.rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  register,
  login,
  getUserById,
  getAllUsers
};
