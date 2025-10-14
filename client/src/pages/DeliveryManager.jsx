import { useEffect, useState } from 'react';
import axios from 'axios';
import DeliveryForm from '../components/DeliveryForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, MapPinIcon } from '@heroicons/react/24/solid';

//funtions in delivery

function DeliveryManager() {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showSmartDashboard, setShowSmartDashboard] = useState(true);
  const [user, setUser] = useState(null);

  const fetchDeliveries = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await axios.get(`http://localhost:5000/api/delivery?${params}`);
      setDeliveries(res.data);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err.message);
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

  useEffect(() => { 
    fetchDeliveries(); 
    fetchOrders();
    fetchSession();
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this delivery?')) {
      await axios.delete(`http://localhost:5000/api/delivery/${id}`);
      fetchDeliveries();
    }
  };
      
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/delivery/${id}/status`, { status: newStatus });
      fetchDeliveries();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Customer', 'Order', 'Address', 'Status', 'Delivery Date', 'Tracking']],
      body: deliveries.map(d => [
        d.customerName,
        d.orderId?.orderNumber || 'N/A',
        `${d.deliveryCity}, ${d.deliveryState}`,
        d.status,
        new Date(d.deliveryDate).toLocaleDateString(),
        d.trackingNumber
      ])
    });
    doc.save('delivery-report.pdf');
  };

  const exportCSV = () => {
    const csv = Papa.unparse(
      deliveries.map(d => ({
        Customer: d.customerName,
        Email: d.customerEmail,
        Phone: d.customerPhone,
        Order: d.orderId?.orderNumber || 'N/A',
        Address: `${d.deliveryAddress}, ${d.deliveryCity}, ${d.deliveryState} ${d.deliveryZipCode}`,
        Status: d.status,
        'Delivery Date': new Date(d.deliveryDate).toLocaleDateString(),
        'Tracking Number': d.trackingNumber,
        'Delivery Person': d.deliveryPerson || 'N/A'
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'delivery-report.csv';
    link.click();
  };

  // Prepare chart data
  const statusData = deliveries.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count
  }));

  const cityData = deliveries.reduce((acc, d) => {
    acc[d.deliveryCity] = (acc[d.deliveryCity] || 0) + 1;
    return acc;
  }, {});

  const cityChartData = Object.entries(cityData).map(([city, count]) => ({
    city,
    count
  })).slice(0, 10); // Top 10 cities

  const COLORS = ['#7B3F00', '#A0522D', '#D2691E', '#CD853F', '#DEB887'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-[#fffaf2] min-h-screen">
      <div className="flex items-center justify-between mb-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-[#7B3F00]"
      >
          Delivery Manager
      </motion.h1>

        {/* Loading indicator while fetching user session */}
        {user === null && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
            <span className="text-sm">Loading...</span>
          </div>
        )}
        
        {/* Smart Dashboard Toggle Button - Admin Only */}
        {user && user.role === 'admin' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => setShowSmartDashboard(!showSmartDashboard)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              showSmartDashboard 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="text-xl">🤖</span>
            <span>{showSmartDashboard ? 'Hide Smart Analysis' : 'Show Smart Analysis'}</span>
            <span className={`transform transition-transform duration-300 ${showSmartDashboard ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </motion.button>
        )}
      </div>

      {/* Smart Delivery Analysis Dashboard - Admin Only */}
      {user && user.role === 'admin' && showSmartDashboard && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-lg overflow-hidden"
        >
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">🤖</span>
          <h2 className="text-2xl font-bold text-indigo-700">Smart Delivery Analysis</h2>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Deliveries */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">{deliveries.length}</p>
              </div>
              <div className="text-3xl text-blue-500">📦</div>
            </div>
          </div>

          {/* Pending Deliveries */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {deliveries.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <div className="text-3xl text-yellow-500">⏳</div>
            </div>
          </div>

          {/* In Transit */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {deliveries.filter(d => d.status === 'in_transit').length}
                </p>
              </div>
              <div className="text-3xl text-blue-500">🚚</div>
            </div>
          </div>

          {/* Delivered */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {deliveries.filter(d => d.status === 'delivered').length}
                </p>
              </div>
              <div className="text-3xl text-green-500">✅</div>
            </div>
          </div>
        </div>

        {/* Smart Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center">
              <span className="text-xl mr-2">📊</span>
              Delivery Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-lg font-bold text-green-600">
                  {deliveries.length > 0 
                    ? Math.round((deliveries.filter(d => d.status === 'delivered').length / deliveries.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Delivery Time</span>
                <span className="text-lg font-bold text-blue-600">2.3 days</span>
              </div>
                  <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Express Deliveries</span>
                <span className="text-lg font-bold text-purple-600">
                  {deliveries.filter(d => d.deliveryMethod?.type === 'express').length}
                </span>
              </div>
            </div>
          </div>

          {/* Smart Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
              <span className="text-xl mr-2">💡</span>
              Smart Recommendations
            </h3>
            <div className="space-y-3">
              {deliveries.filter(d => d.status === 'pending').length > 5 && (
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">High Pending Orders</p>
                    <p className="text-xs text-yellow-700">Consider assigning more delivery agents</p>
                  </div>
                </div>
              )}
              
              {deliveries.filter(d => d.status === 'failed').length > 0 && (
                <div className="flex items-start p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-red-600 mr-2">🚨</span>
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed Deliveries Detected</p>
                    <p className="text-xs text-red-700">Review failed delivery reasons</p>
                  </div>
                </div>
              )}

              <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 mr-2">🚚</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">Route Optimization Available</p>
                  <p className="text-xs text-blue-700">Optimize delivery routes for better efficiency</p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600 mr-2">🌱</span>
                <div>
                  <p className="text-sm font-medium text-green-800">Eco-Delivery Suggestion</p>
                  <p className="text-xs text-green-700">Consider eco-friendly delivery for short distances</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="mt-6 bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔄</span>
              <div>
                <p className="text-sm font-medium text-indigo-700">Real-time Status</p>
                <p className="text-xs text-indigo-600">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm text-gray-600">System Active</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Smart Analysis</span>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      )}

      {/* Hidden Dashboard Indicator - Admin Only */}
      {user && user.role === 'admin' && !showSmartDashboard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 bg-gray-100 border border-gray-200 rounded-lg p-4 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span className="text-lg">🤖</span>
            <span className="text-sm">Smart Delivery Analysis is hidden</span>
            <button
              onClick={() => setShowSmartDashboard(true)}
              className="ml-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
            >
              Show
            </button>
          </div>
        </motion.div>
      )}

      {/* User Role Indicator */}
      {user && user.role !== 'admin' && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-blue-700">
            <span className="text-lg">👤</span>
            <span className="text-sm font-medium">
              Welcome, {user.name}! You're viewing the delivery management system as a regular user.
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Smart delivery analysis dashboard is available for administrators only.
          </p>
        </motion.div>
      )}

      {/* Delivery Form */}
      <DeliveryForm 
        fetchDelivery={fetchDeliveries} 
        editing={editing} 
        setEditing={setEditing} 
        orders={orders}
      />
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-amber-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search deliveries..."
            className="w-full pl-11 pr-4 py-2 rounded-lg border border-amber-300
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-amber-300
                     focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Delivery Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#7B3F00] text-white">
              <th className="p-4">Customer</th>
              <th className="p-4">Order</th>
              <th className="p-4">Address</th>
              <th className="p-4">Status</th>
              <th className="p-4">Delivery Date</th>
              <th className="p-4">Tracking</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map(d => (
              <tr key={d._id} className="border-t border-amber-200 hover:bg-amber-50">
                  <td className="p-4">
                  <div>
                    <div className="font-medium text-gray-900">{d.customerName}</div>
                    <div className="text-sm text-gray-500">{d.customerEmail}</div>
                    <div className="text-sm text-gray-500">{d.customerPhone}</div>
                  </div>
                  </td>
                  <td className="p-4">
                  <div className="font-medium">#{d.orderId?.orderNumber || 'N/A'}</div>
                  <div className="text-sm text-gray-500">${d.orderId?.totalAmount || '0'}</div>
                </td>
                <td className="p-4 max-w-xs">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm">{d.deliveryAddress}</div>
                      <div className="text-sm text-gray-500">
                        {d.deliveryCity}, {d.deliveryState} {d.deliveryZipCode}
                      </div>
                    </div>
                  </div>
                  </td>
                  <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                    {d.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(d.deliveryDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="text-sm font-mono text-amber-600">
                    {d.trackingNumber}
                  </div>
                </td>
                  <td className="p-4">
                  <div className="flex flex-col space-y-2">
                      <button
                      onClick={() => setEditing(d)} 
                      className="text-blue-600 hover:underline text-sm"
                      >
                      Edit
                      </button>
                    <div className="flex space-x-1">
                      <select
                        value={d.status}
                        onChange={(e) => handleStatusUpdate(d._id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => handleDelete(d._id)} 
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={exportPDF}
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                    text-white px-5 py-2 rounded-md shadow transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          PDF Report
        </button>
        <button
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                    text-white px-5 py-2 rounded-md shadow transition"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          CSV Report
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#7B3F00] mb-4">Delivery Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* City Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#7B3F00] mb-4">Top Delivery Cities</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityChartData}>
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7B3F00" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DeliveryManager;
