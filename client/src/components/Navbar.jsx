import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import logo from '../assets/logo.svg';

function Navbar() {
  const [user, setUser] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Fetch session user
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => {
        setUser(null);
      });
  }, []);

  // Fetch low stock count for bell notification
  const fetchLowStockCount = async () => {
    if (user) {
      setIsRefreshing(true);
      try {
        const response = await axios.get('http://localhost:5000/api/inventory');
        const lowStockItems = response.data.filter(item => item.quantity <= 10);
        setLowStockCount(lowStockItems.length);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setLowStockCount(0);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchLowStockCount();
  }, [user]);

  // Refresh count when page becomes visible (user switches tabs/windows)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchLowStockCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Refresh count every 30 seconds when user is active
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchLowStockCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md border-b border-[#D6A77A]">
      {/* Left: Logo */}
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Arachchi Spice Logo" className="h-12" />
      </div>

      {/* Center: Nav Links */}
      <div className="hidden md:flex space-x-8 text-[#7B3F00] font-semibold">
        <Link
          to="/home"
          className="hover:text-[#D6A77A] transition-colors duration-300"
        >
          Home
        </Link>
        <Link
          to="/view-products"
          className="hover:text-[#D6A77A] transition-colors duration-300"
        >
          Products
        </Link>
        <Link
          to="/supplier-manager"
          className="hover:text-[#D6A77A] transition-colors duration-300"
        >
          Suppliers
        </Link>
        <Link
          to="/customer-manager"
          className="hover:text-[#D6A77A] transition-colors duration-300"
        >
          Customers
        </Link>
        <Link
          to="/order-manager"
          className="hover:text-[#D6A77A] transition-colors duration-300"
        >
          Orders
        </Link>
        <Link
          to="/inventory-manager"
          className="hover:text-[#D6A77A] transition-colors duration-300"
        >
          Inventory
        </Link>
        <Link
          to="/feedback-manager"
          className="hover:text-[#D6A77A] transition-colors duration-300"
        >
          Feedback
        </Link>
        <Link
          to="/delivery-manager"
          className="hover:text-[#D6A77A] transition-colors duration-300"
        >
          Delivery
        </Link>
      </div>

      {/* Right: Bell Notification, User Info and Logout */}
      <div className="flex items-center space-x-4">
        {/* Bell Notification Icon */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full transition-colors text-lg ${
                lowStockCount > 0 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-[#7B3F00] hover:bg-[#5C2C00] text-white'
              }`}
              title={`Low Stock Alerts (${lowStockCount} items)`}
            >
              🔔
            </button>
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse font-bold">
                {lowStockCount}
              </span>
            )}
            {lowStockCount === 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                ✓
              </span>
            )}
          </div>
        )}

        {user ? (
          <>
            {/* Wrap username in a Link to navigate to the profile page */}
            <Link 
              to="/profile"
              className="text-[#7B3F00] font-semibold hover:text-[#D6A77A] transition-colors duration-300"
            >
              {user.username}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-[#7B3F00] hover:bg-[#D6A77A] transition-colors duration-300 text-white py-2 px-5 rounded-lg shadow"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-[#7B3F00] hover:bg-[#D6A77A] transition-colors duration-300 text-white py-2 px-5 rounded-lg shadow"
          >
            Login
          </Link>
        )}
      </div>

      {/* Notification Panel */}
      {showNotifications && user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 right-8 z-50 bg-white rounded-lg shadow-xl border border-amber-200 p-4 max-w-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-[#7B3F00]">Stock Alerts</h4>
            <button
              onClick={fetchLowStockCount}
              disabled={isRefreshing}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isRefreshing 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Refresh count"
            >
              {isRefreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
          {lowStockCount > 0 ? (
            <div className="space-y-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-sm text-red-700">
                    {lowStockCount} items have low stock (≤10 units)
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  navigate('/inventory-manager');
                  setShowNotifications(false);
                }}
                className="w-full bg-[#7B3F00] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#5C2C00] transition-colors"
              >
                View Inventory Manager
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm text-green-700">All stock levels are adequate</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowNotifications(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </motion.div>
      )}
    </nav>
  );
}

export default Navbar;
