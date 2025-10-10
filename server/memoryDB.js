// Simple in-memory database for users
let users = [];
let nextId = 1;

// User operations
const createUser = async (userData) => {
  const { username, email, password, role = 'user' } = userData;
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Create new user
  const newUser = {
    id: nextId++,
    username,
    email,
    password,
    role,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  return { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role };
};

const findUserByEmail = async (email) => {
  return users.find(u => u.email === email);
};

const findUserById = async (id) => {
  return users.find(u => u.id === id);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  users
};




