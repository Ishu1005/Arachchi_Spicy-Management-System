const { createUser, findUserByEmail } = require('../memoryDB');
const bcrypt = require('bcryptjs');

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateUsername = (username) => {
  return username && username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
};

// Register New User
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({ msg: 'Username must be at least 3 characters and contain only letters, numbers, and underscores' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ msg: 'Please enter a valid email address' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await createUser({ username, email, password: hashedPassword, role });
    res.status(201).json({ msg: 'Registered successfully' });
  } catch (err) {
    if (err.message === 'User already exists') {
      return res.status(400).json({ msg: 'User already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Login User and Save to Session
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ msg: 'Please enter a valid email address' });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ msg: 'Invalid email' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Incorrect password' });

    // Save full user info (id, username, email, role) in session
    req.session.user = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.status(200).json({ msg: 'Login successful', user: req.session.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout and Destroy Session
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ msg: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ msg: 'Logged out successfully' });
  });
};

// Get Current Session User
exports.getSession = async (req, res) => {
  try {
    if (req.session.user) {
      const { findUserById } = require('../memoryDB');
      const user = await findUserById(parseInt(req.session.user.id));
      if (user) {
        res.json({ 
          user: {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      } else {
        res.status(401).json({ msg: 'User not found' });
      }
    } else {
      res.status(401).json({ msg: 'No session found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
