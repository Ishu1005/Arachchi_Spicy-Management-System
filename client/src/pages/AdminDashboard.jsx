import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => {
        if (res.data.user.role !== 'admin') {
          alert('Access denied: Admins only.');
          navigate('/');
        } else {
          setUser(res.data.user);
          axios
            .get('http://localhost:5000/api/admin/stats')
            .then(response => setStats(response.data))
            .catch(err => console.error('Error fetching stats:', err));
        }
      })
      .catch(() => {
        alert('Please log in first.');
        navigate('/');
      });
  }, [navigate]);

  const handleLogout = async () => {
    await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });
    navigate('/');
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFaf2]">
      {user ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#7B3F00]">
              Welcome, {user.username}! (Admin Dashboard)
            </h1>
            <button
              onClick={handleLogout}
              className="bg-[#7B3F00] text-white px-4 py-2 rounded hover:bg-[#5C2C00] shadow-md"
            >
              Logout
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Total Products', value: stats.totalProducts, icon: '🧂' },
                { label: 'Active Orders', value: stats.activeOrders, icon: '🛒' },
                { label: 'Suppliers', value: stats.suppliers, icon: '🚚' },
                { label: 'Customers', value: stats.customers, icon: '👥' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl shadow-lg bg-[rgba(255,250,242,0.8)] border border-[#D6A77A]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm mb-1 text-[#7B3F00] font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-[#7B3F00]">{stat.value}</p>
                    </div>
                    <div className="text-3xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: '🧂 Product Management', path: '/product-manager', desc: 'Manage spices, prices, images, and reports' },
              { title: '🚚 Supplier Management', path: '/supplier-manager', desc: 'Manage suppliers and contacts' },
              { title: '👥 Customers Management', path: '/customer-manager', desc: 'Manage customers and their information' },
              { title: '📦 Inventory Management', path: '/inventory-manager', desc: 'Manage inventory items and stock levels' },
              { title: '🛒 Order Management', path: '/order-manager', desc: 'Manage customer orders and shipments' }
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => navigate(item.path)}
                className="cursor-pointer bg-[rgba(255,250,242,0.9)] border border-[#D6A77A] p-6 rounded-xl hover:bg-[#f8ede1] transition duration-150 shadow-md"
              >
                <h2 className="text-xl font-semibold text-[#7B3F00]">{item.title}</h2>
                <p className="text-sm text-[#7B3F00] mt-2">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="p-6 rounded-xl shadow-md bg-[rgba(255,250,242,0.9)] border border-[#D6A77A]">
              <h3 className="text-2xl font-bold mb-6 text-[#7B3F00]">Quick Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/view-products')}
                  className="w-full p-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 bg-[#7B3F00] hover:bg-[#5C2C00]"
                >
                  🧂 View All Spices
                </button>
                <button
                  onClick={() => navigate('/product-manager')}
                  className="w-full p-4 rounded-lg font-semibold text-[#7B3F00] border-2 border-[#7B3F00] hover:bg-[#7B3F00] hover:text-white transition-all transform hover:scale-105"
                >
                  ➕ Add New Product
                </button>
              </div>
            </div>
          </div>


        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-[#FFFaf2]">
          <p className="text-[#7B3F00] font-semibold text-x2">Loading admin info...</p>
        </div>

      )}
    </div>
  );
}

export default AdminDashboard;
