import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Configure axios to include credentials for session management
axios.defaults.withCredentials = true;

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Registration failed' };
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Login failed' };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/logout`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Logout failed' };
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const response = await axios.get(`${API_URL}/session`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { msg: 'Session check failed' };
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const session = await getCurrentSession();
    return !!session.user;
  } catch (error) {
    return false;
  }
};
