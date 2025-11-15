const bcrypt = require('bcrypt');
const { supabase } = require('../index');

const SALT_ROUNDS = 10;

// Register a new user
async function register(username, email, password) {
  try {
    console.log('Registering user:', { username, email });
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, password_hash: passwordHash }])
      .select('id, username, email, role, created_at')
      .single();
    
    if (error) {
      console.error('Supabase register error:', error);
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        }
        if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
      }
      throw error;
    }
    
    console.log('User registered successfully:', data);
    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

// Login user
async function login(usernameOrEmail, password) {
  try {
    // Query for user by username OR email
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, password_hash, role, created_at')
      .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
      .maybeSingle();
    
    if (error) {
      console.error('Supabase login error:', error);
      throw new Error('Invalid credentials');
    }
    
    if (!data) {
      throw new Error('Invalid credentials');
    }
    
    const isValid = await bcrypt.compare(password, data.password_hash);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Don't return password hash
    const { password_hash, ...user } = data;
    return user;
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      throw error;
    }
    console.error('Login error:', error);
    throw new Error('Invalid credentials');
  }
}

// Get user by ID
async function getUserById(id) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
}

// Get all users
async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
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
