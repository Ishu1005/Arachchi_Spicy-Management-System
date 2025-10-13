import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import logo from '../assets/logo.svg';
import NotificationBell from './NotificationBell';

function Navbar() {
  const [user, setUser] = useState(null);
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

      {/* Right: User Info and Logout */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <NotificationBell />
        
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
    </nav>
  );
}

export default Navbar;
