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

  useEffect(() => { 
    fetchDeliveries(); 
    fetchOrders();
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
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-[#7B3F00] mb-6"
      >
        Delivery Manager
      </motion.h1>

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
