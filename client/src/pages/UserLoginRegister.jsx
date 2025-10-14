import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser, loginUser } from '../services/authService';

function UserLoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateUsername = (username) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!form.username || !validateUsername(form.username)) {
        newErrors.username = 'Username must be at least 3 characters and contain only letters, numbers, and underscores';
      }
    }

    if (!form.email || !validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password || !validatePassword(form.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const resetForm = () => {
    setForm({ username: '', email: '', password: '' });
    setErrors({});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const response = await loginUser(form);
        const { user } = response;
        toast.success(`Welcome back, ${user.username}!`);
        
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/home');
        }
      } else {
        await registerUser({ ...form, role: 'user' });
        toast.success('Registered successfully! Please log in.');
        setIsLogin(true);
        resetForm();
      }
    } catch (err) {
      const errorMsg = err.msg || err.message || 'Something went wrong';
      toast.error(errorMsg);
      
      // Handle specific error cases
      if (err.msg === 'User already exists') {
        setErrors({ email: 'This email is already registered' });
      } else if (err.msg === 'Invalid email') {
        setErrors({ email: 'Invalid email address' });
      } else if (err.msg === 'Incorrect password') {
        setErrors({ password: 'Incorrect password' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat font-sans"
      style={{
        backgroundImage: "url('/assets/cinnamon-bg.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-30 z-0" />
      <div className="relative z-10 w-full max-w-md bg-[#fffaf2cc] rounded-xl shadow-lg overflow-hidden border border-[#d6a77a]">
        <div className="flex">
          <button
            onClick={() => {
              setIsLogin(true);
              resetForm();
            }}
            className={`w-1/2 py-3 font-bold transition-all duration-300 ${
              isLogin
                ? 'bg-[#7B3F00] text-white'
                : 'bg-[#FDEAD7] text-[#7B3F00] hover:bg-[#ecd5b9]'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              resetForm();
            }}
            className={`w-1/2 py-3 font-bold transition-all duration-300 ${
              !isLogin
                ? 'bg-[#7B3F00] text-white'
                : 'bg-[#FDEAD7] text-[#7B3F00] hover:bg-[#ecd5b9]'
            }`}
          >
            Register
          </button>
        </div>

        <div className="relative w-full overflow-hidden h-[320px]">
          <div
            className="flex w-[200%] transition-transform duration-700 ease-in-out"
            style={{ transform: isLogin ? 'translateX(0%)' : 'translateX(-50%)' }}
          >
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="w-1/2 p-6 space-y-4 bg-[#fffaf2]">
              <div>
                <label className="block text-sm font-medium text-[#7B3F00] mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#D6A77A] focus:ring-[#D6A77A]'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7B3F00] mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#D6A77A] focus:ring-[#D6A77A]'
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 mt-4 text-white rounded-md transition font-semibold ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#7B3F00] hover:bg-[#5c2c00]'
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="w-1/2 p-6 space-y-3 bg-[#fffaf2]">
              <div>
                <label className="block text-sm font-medium text-[#7B3F00] mb-2">User Name</label>
                <input
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.username 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#D6A77A] focus:ring-[#D6A77A]'
                  }`}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7B3F00] mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#D6A77A] focus:ring-[#D6A77A]'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7B3F00] mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-[#D6A77A] focus:ring-[#D6A77A]'
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 mt-4 text-white rounded-md transition font-semibold ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#7B3F00] hover:bg-[#5c2c00]'
                }`}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>

        {/* Admin Register */}
        <div className="text-center pt-3 pb-9">
          <button
            onClick={() => navigate('/admin-register')}
            className="text-sm text-[#7B3F00] underline hover:text-[#5c2c00]"
          >
            Register as Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserLoginRegister;
