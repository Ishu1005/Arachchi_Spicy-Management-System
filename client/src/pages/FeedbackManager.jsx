import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, StarIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

function FeedbackManager() {
  const [feedback, setFeedback] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingHistory, setRatingHistory] = useState([]);
  const [showChart, setShowChart] = useState(false);

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

  const fetchRatingHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/feedback');
      const feedbacks = response.data;
      
      // Process rating data for chart
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayFeedbacks = feedbacks.filter(feedback => {
          const feedbackDate = new Date(feedback.createdAt).toISOString().split('T')[0];
          return feedbackDate === dateStr;
        });
        
        const avgRating = dayFeedbacks.length > 0 
          ? dayFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / dayFeedbacks.length
          : 0;
        
        last7Days.push({
          date: dateStr,
          averageRating: Math.round(avgRating * 10) / 10,
          count: dayFeedbacks.length
        });
      }
      
      setRatingHistory(last7Days);
    } catch (error) {
      console.error('Error fetching rating history:', error);
    }
  };

  useEffect(() => { 
    fetchFeedback(); 
    fetchProducts();
    fetchRatingHistory();
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this feedback?')) {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      fetchFeedback();
      fetchRatingHistory(); // Refresh chart data
    }
  };

  // Chart data configuration with emoji wave effects
  const chartData = {
    labels: ratingHistory.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Average Rating',
        data: ratingHistory.map(item => item.averageRating),
        borderColor: 'rgb(123, 63, 0)',
        backgroundColor: 'rgba(123, 63, 0, 0.1)',
        borderWidth: 4,
        pointBackgroundColor: 'rgb(123, 63, 0)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 8,
        tension: 0.6, // More wave-like curve
        pointHoverRadius: 12,
        pointHoverBackgroundColor: 'rgb(123, 63, 0)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 4,
      },
      {
        label: 'Feedback Count',
        data: ratingHistory.map(item => item.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.6, // More wave-like curve
        yAxisID: 'y1',
        pointHoverRadius: 10,
        pointHoverBackgroundColor: 'rgb(34, 197, 94)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom height
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: '📊 Smart Rating Trends (Last 7 Days) 🌟',
        font: {
          size: 14,
          weight: 'bold'
        },
        color: '#7B3F00'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#7B3F00',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `📅 ${context[0].label}`;
          },
          label: function(context) {
            const emoji = context.datasetIndex === 0 ? 
              (context.parsed.y >= 4 ? '🌟' : context.parsed.y >= 3 ? '😊' : context.parsed.y >= 2 ? '😐' : '😞') :
              '📝';
            return `${emoji} ${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 5,
        title: {
          display: true,
          text: '⭐ Average Rating (1-5)',
          color: '#7B3F00',
          font: {
            size: 11,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#7B3F00',
          font: {
            size: 10
          },
          callback: function(value) {
            const emojis = ['😞', '😐', '😊', '🌟', '🎉'];
            return `${emojis[value - 1] || ''} ${value}`;
          }
        },
        grid: {
          color: 'rgba(123, 63, 0, 0.1)',
          drawBorder: true,
          borderColor: '#7B3F00'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: '📝 Feedback Count',
          color: '#22c55e',
          font: {
            size: 11,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#22c55e',
          font: {
            size: 10
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: '#7B3F00',
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(123, 63, 0, 0.1)',
          drawBorder: true,
          borderColor: '#7B3F00'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/feedback/${id}/approve`);
      toast.success('Feedback approved!');
      fetchFeedback();
      fetchRatingHistory(); // Refresh chart data
    } catch (err) {
      console.error('Failed to approve feedback:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/feedback/${id}/reject`);
      toast.success('Feedback rejected!');
      fetchFeedback();
      fetchRatingHistory(); // Refresh chart data
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

  const barChartData = Object.entries(ratingData).map(([rating, count]) => ({
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
        fetchRatingHistory={fetchRatingHistory}
      />
      
      {/* Smart Rating Chart */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-800">📊 Smart Rating Trends</h3>
          <motion.button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showChart ? 'Hide Chart' : 'Show Chart'}
          </motion.button>
        </div>
        
        {showChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-3 rounded-lg shadow-sm"
          >
            <div style={{ height: '300px', width: '100%' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="text-lg font-bold text-[#7B3F00]">
                  {ratingHistory.length > 0 ? ratingHistory[ratingHistory.length - 1].averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="text-gray-600">Current Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {ratingHistory.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <div className="text-gray-600">Total Feedbacks</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
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
            <BarChart data={barChartData}>
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
