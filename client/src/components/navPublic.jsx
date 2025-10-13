import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import logo from '../assets/logo.svg';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md border-b border-[#D6A77A]">
      {/* Left: Logo */}
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Arachchi Spice Logo" className="h-12" />
      </div>

      {/* Center: Links */}
      <div className="hidden md:flex space-x-8 text-[#7B3F00] font-semibold">
        <Link to="/home" className="hover:text-[#D6A77A] transition-colors duration-300">Home</Link>
        <Link to="/view-products" className="hover:text-[#D6A77A] transition-colors duration-300">Products</Link>
        <Link to="/supplier-manager" className="hover:text-[#D6A77A] transition-colors duration-300">Suppliers</Link>
        <Link to="/customer-manager" className="hover:text-[#D6A77A] transition-colors duration-300">Customers</Link>
        <Link to="/order-manager" className="hover:text-[#D6A77A] transition-colors duration-300">Orders</Link>
        <Link to="/inventory-manager" className="hover:text-[#D6A77A] transition-colors duration-300">Inventory</Link>
      </div>

      {/* Right: User info and logout */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-[#7B3F00] font-semibold">{user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-[#7B3F00] hover:bg-[#D6A77A] text-white py-2 px-5 rounded-lg shadow transition-colors duration-300"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-[#7B3F00] hover:bg-[#D6A77A] text-white py-2 px-5 rounded-lg shadow transition-colors duration-300"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
