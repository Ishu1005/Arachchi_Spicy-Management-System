import { useEffect, useState } from 'react';
import axios from 'axios';
import OrderForm from '../components/OrderForm';
import SriLankaMap from '../components/SriLankaMap';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, MapPinIcon } from '@heroicons/react/24/solid';
import {
  BarChart,
  PieChart,
  LineChart,
  SummaryCard
} from '../components/SimpleCharts';

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState({
    salesBySpiceType: null,
    customerOrderFrequency: null,
    monthlyOrderTrend: null,
    orderStatusDistribution: null
  });
  const [showCharts, setShowCharts] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders`, {
        withCredentials: true
      });
      setOrders(res.data);
      // Also refresh chart data when orders are updated
      if (showCharts) {
        fetchChartData();
      }
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data || err.message);
      toast.error('Failed to load orders.');
    }
  };

  const fetchSession = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/session', {
        withCredentials: true
      });
      setUser(res.data.user);
    } catch (err) {
      console.error('No user session:', err.response?.data || err.message);
      setUser(null);
    }
  };

  const fetchChartData = async () => {
    try {
      const [
        salesBySpiceTypeRes,
        customerOrderFrequencyRes,
        monthlyOrderTrendRes,
        orderStatusDistributionRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/sales-by-spice-type', {
          withCredentials: true
        }),
        axios.get('http://localhost:5000/api/analytics/customer-order-frequency', {
          withCredentials: true
        }),
        axios.get('http://localhost:5000/api/analytics/monthly-order-trend', {
          withCredentials: true
        }),
        axios.get('http://localhost:5000/api/analytics/order-status-distribution', {
          withCredentials: true
        })
      ]);

      setChartData({
        salesBySpiceType: salesBySpiceTypeRes.data,
        customerOrderFrequency: customerOrderFrequencyRes.data,
        monthlyOrderTrend: monthlyOrderTrendRes.data,
        orderStatusDistribution: orderStatusDistributionRes.data
      });
    } catch (err) {
      console.error('Error fetching chart data:', err);
      toast.error('Failed to load analytics data');
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchChartData();
    }
  }, [search, user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${id}`, {
          withCredentials: true
        });
        if (editing && editing._id === id) setEditing(null);
        fetchOrders();
        toast.success('Order deleted successfully!');
      } catch (err) {
        console.error('Error deleting order:', err.response?.data || err.message);
        toast.error('Failed to delete the order.');
      }
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Order Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = ['Customer', 'Contact', 'Items', 'Payment', 'Delivery', 'Address', 'Date', 'Time'];
    const tableRows = orders.map(order => [
      order.customerName || '-',
      order.customerContact || '-',
      (order.items || []).map(item => `${item.name} (${item.quantity})`).join(', '),
      order.paymentMethod,
      order.deliveryMethod,
      order.address,
      order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-',
      order.orderTime || '-'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    doc.save(`Order_Report_${Date.now()}.pdf`);
    toast.success('PDF Report generated successfully!');
  };

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowMap(true);
  };

  return (
    <div className="min-h-screen bg-[#fffaf2] overflow-x-hidden p-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-[#7B3F00] mb-6"
      >
        Order Management
      </motion.h1>

      <OrderForm fetchOrders={fetchOrders} editing={editing} setEditing={setEditing} />

      {/* Admin Only Message for Regular Users */}
      {user && user.role !== 'admin' && (
        <div className="mt-8 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Analytics Access:</strong> Order analytics and charts are available only to admin users. 
                Contact your administrator if you need access to detailed analytics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts Section - Admin Only */}
      {user && user.role === 'admin' && (
        <div className="mt-8 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#7B3F00]">Order Analytics (Admin Only)</h2>
            <button
              onClick={() => {
                setShowCharts(!showCharts);
                if (!showCharts) {
                  fetchChartData();
                }
              }}
              className="bg-[#7B3F00] text-white px-4 py-2 rounded-lg hover:bg-[#5C2C00] transition-colors"
            >
              {showCharts ? 'Hide Charts' : 'Show Analytics'}
            </button>
          </div>

        {showCharts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <SummaryCard title="Total Orders" value={orders.length} icon="📦" />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales by Spice Type */}
              {chartData.salesBySpiceType && (
                <PieChart 
                  data={chartData.salesBySpiceType} 
                  title="Total Sales by Spice Type" 
                />
              )}

              {/* Customer Order Frequency */}
              {chartData.customerOrderFrequency && (
                <BarChart 
                  data={chartData.customerOrderFrequency} 
                  title="Customer Order Frequency (Top 10)" 
                  color="#36A2EB"
                />
              )}

              {/* Monthly Order Trend */}
              {chartData.monthlyOrderTrend && (
                <LineChart 
                  data={chartData.monthlyOrderTrend} 
                  title="Monthly Order Trend" 
                />
              )}

              {/* Order Status Distribution */}
              {chartData.orderStatusDistribution && (
                <PieChart 
                  data={chartData.orderStatusDistribution}
                  title="Order Status Distribution"
                />
              )}
            </div>
          </motion.div>
        )}
        </div>
      )}

      <div className="mt-8 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-cinnamon-light" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search supplier..."
            className="w-full pl-11 pr-4 py-2 rounded-lg border border-cinnamon-light
                       focus:outline-none focus:ring-2 focus:ring-cinnamon"
          />
        </div>

        {/* Report Button */}
        <button
          onClick={generatePDFReport}
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                     text-white px-5 py-2 rounded-md shadow transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Order Report
        </button>
      </div>

      <table className="w-full mt-6 text-left border-collapse border border-gray-300">
        <thead>
          <tr className="bg-amber-200">
            <th className="p-3 border border-gray-300">Customer</th>
            <th className="p-3 border border-gray-300">Contact</th>
            <th className="p-3 border border-gray-300">Items</th>
            <th className="p-3 border border-gray-300">Payment</th>
            <th className="p-3 border border-gray-300">Delivery</th>
            <th className="p-3 border border-gray-300">Address</th>
            <th className="p-3 border border-gray-300">Date</th>
            <th className="p-3 border border-gray-300">Time</th>
            <th className="p-3 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order._id} className="border-t border-gray-300 align-top">
                <td className="p-2 border border-gray-300">{order.customerName || '-'}</td>
                <td className="p-2 border border-gray-300">{order.customerContact || '-'}</td>
                <td className="p-2 border border-gray-300">
                  <ul className="list-disc ml-4">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.name} ({item.quantity}) {item.category && `- ${item.category}`}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-2 border border-gray-300">{order.paymentMethod}</td>
                <td className="p-2 border border-gray-300">{order.deliveryMethod}</td>
                <td className="p-2 border border-gray-300">{order.address}</td>
                <td className="p-2 border border-gray-300">
                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                </td>
                <td className="p-2 border border-gray-300">{order.orderTime || '-'}</td>
                <td className="p-2 border border-gray-300 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {/* Track Order Button - Available for all users */}
                    <button
                      onClick={() => handleTrackOrder(order)}
                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                      title="Track Order on Map"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      Track
                    </button>
                    
                    {/* Admin/Order Owner Actions */}
                    {(user?.role === 'admin' || user?.id === order.createdBy) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(order)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center p-4 text-gray-500">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Sri Lanka Map Modal */}
      <SriLankaMap 
        isOpen={showMap} 
        onClose={() => {
          setShowMap(false);
          setSelectedOrder(null);
        }} 
        order={selectedOrder} 
      />
    </div>
  );
}

export default OrderManager;
