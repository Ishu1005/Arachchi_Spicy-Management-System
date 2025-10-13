import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, StarIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

function FeedbackManager() {
  const [feedback, setFeedback] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFeedback = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await axios.get(`http://localhost:5000/api/feedback?${params}`);
      setFeedback(res.data);
    } catch (err) {
      console.error("Failed to fetch feedback:", err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err.message);
    }
  };

  useEffect(() => { 
    fetchFeedback(); 
    fetchProducts();
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this feedback?')) {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      fetchFeedback();
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/feedback/${id}/approve`);
      toast.success('Feedback approved!');
      fetchFeedback();
    } catch (err) {
      console.error('Failed to approve feedback:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/feedback/${id}/reject`);
      toast.success('Feedback rejected!');
      fetchFeedback();
    } catch (err) {
      console.error('Failed to reject feedback:', err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Customer', 'Product', 'Rating', 'Comment', 'Status', 'Date']],
      body: feedback.map(f => [
        f.customerName,
        f.productId?.name || 'N/A',
        f.rating,
        f.comment.substring(0, 50) + '...',
        f.status,
        new Date(f.createdAt).toLocaleDateString()
      ])
    });
    doc.save('feedback-report.pdf');
  };

  const exportCSV = () => {
    const csv = Papa.unparse(
      feedback.map(f => ({
        Customer: f.customerName,
        Email: f.customerEmail,
        Product: f.productId?.name || 'N/A',
        Rating: f.rating,
        Comment: f.comment,
        Status: f.status,
        Date: new Date(f.createdAt).toLocaleDateString()
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'feedback-report.csv';
    link.click();
  };

  // Prepare chart data
  const ratingData = feedback.reduce((acc, f) => {
    const rating = f.rating;
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(ratingData).map(([rating, count]) => ({
    rating: `${rating} Star${rating > 1 ? 's' : ''}`,
    count
  }));

  const statusData = feedback.reduce((acc, f) => {
    acc[f.status] = (acc[f.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count
  }));

  const COLORS = ['#7B3F00', '#A0522D', '#D2691E', '#CD853F', '#DEB887'];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="p-6 bg-[#fffaf2] min-h-screen">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-[#7B3F00] mb-6"
      >
        Feedback Manager
      </motion.h1>

      {/* Feedback Form */}
      <FeedbackForm 
        fetchFeedback={fetchFeedback} 
        editing={editing} 
        setEditing={setEditing} 
        products={products}
      />
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-amber-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search feedback..."
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
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#7B3F00] text-white">
              <th className="p-4">Customer</th>
              <th className="p-4">Product</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Comment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map(f => (
              <tr key={f._id} className="border-t border-amber-200 hover:bg-amber-50">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-gray-900">{f.customerName}</div>
                    <div className="text-sm text-gray-500">{f.customerEmail}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{f.productId?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{f.productId?.category || ''}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(f.rating)}
                    <span className="ml-2 text-sm text-gray-600">({f.rating})</span>
                  </div>
                </td>
                <td className="p-4 max-w-xs">
                  <div className="truncate" title={f.comment}>
                    {f.comment}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    f.status === 'approved' ? 'bg-green-100 text-green-800' :
                    f.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {f.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(f.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEditing(f)} 
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    {f.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(f._id)} 
                          className="text-green-600 hover:underline text-sm"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(f._id)} 
                          className="text-red-600 hover:underline text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDelete(f._id)} 
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
        {/* Rating Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#7B3F00] mb-4">Rating Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7B3F00" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#7B3F00] mb-4">Status Distribution</h2>
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
      </div>
    </div>
  );
}

export default FeedbackManager;
