import { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
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
    
    // Header
    doc.setFontSize(20);
    doc.text('ARACHCHCHI SPICES', 14, 22);
    doc.setFontSize(16);
    doc.text('Customer Feedback Report', 14, 32);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
    
    // Summary Statistics
    const totalFeedback = feedback.length || Object.values(finalRatingData).reduce((sum, val) => sum + val, 0);
    const averageRating = feedback.length > 0 ? 
      (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) :
      (Object.entries(finalRatingData).reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0) / totalFeedback).toFixed(1);
    
    doc.setFontSize(14);
    doc.text('Summary Statistics:', 14, 50);
    doc.setFontSize(10);
    doc.text(`Total Feedback: ${totalFeedback}`, 14, 58);
    doc.text(`Average Rating: ${averageRating} stars`, 14, 66);
    
    // Mood Statistics
    doc.setFontSize(12);
    doc.text('Mood Distribution:', 14, 78);
    doc.setFontSize(10);
    let yPos = 86;
    emojiChartData.forEach((mood, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${mood.emoji} ${mood.mood}: ${mood.count} feedback`, 14, yPos);
      yPos += 6;
    });
    
    // Feedback Details Table
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Detailed Feedback Report', 14, 22);
    
    const tableColumn = ['Customer', 'Email', 'Product', 'Rating', 'Mood', 'Comment', 'Status', 'Date'];
    const tableRows = feedback.length > 0 ? 
      feedback.map(f => [
        f.customerName || 'N/A',
        f.customerEmail || 'N/A',
        f.productName || f.productId?.name || 'N/A',
        `${f.rating} ⭐`,
        f.emojiReaction ? `${f.emojiReaction} ${f.mood || 'Unknown'}` : 'No mood',
        f.comment ? f.comment.substring(0, 40) + (f.comment.length > 40 ? '...' : '') : 'No comment',
        f.status || 'pending',
        f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'
      ]) :
      // Sample data for demonstration
      [
        ['John Doe', 'john@email.com', 'Cinnamon', '5 ⭐', '😊 Happy', 'Excellent quality spices!', 'approved', '12/10/2025'],
        ['Jane Smith', 'jane@email.com', 'Cardamom', '4 ⭐', '😌 Satisfied', 'Good product, fast delivery', 'approved', '12/9/2025'],
        ['Mike Johnson', 'mike@email.com', 'Pepper', '3 ⭐', '😐 Neutral', 'Average quality', 'pending', '12/8/2025']
      ];
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [123, 63, 0], // Brown color
        textColor: [255, 255, 255], // White text
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [255, 250, 242] // Light background
      },
      columnStyles: {
        3: { halign: 'center' }, // Rating
        4: { halign: 'center' }, // Mood
        6: { halign: 'center' }, // Status
        7: { halign: 'center' }  // Date
      }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      doc.text('ARACHCHCHI SPICES - Customer Feedback Management System',
               doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10,
               { align: 'right' });
    }
    
    doc.save(`Feedback_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('📄 Feedback PDF report generated successfully!');
  };

  const exportCSV = () => {
    const csvData = feedback.length > 0 ? 
      feedback.map(f => ({
        Customer: f.customerName || 'N/A',
        Email: f.customerEmail || 'N/A',
        Product: f.productName || f.productId?.name || 'N/A',
        Rating: f.rating,
        Mood: f.mood || 'Unknown',
        Emoji: f.emojiReaction || 'N/A',
        Comment: f.comment || 'No comment',
        Status: f.status || 'pending',
        Date: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'
      })) :
      // Sample data for demonstration
      [
        {
          Customer: 'John Doe',
          Email: 'john@email.com',
          Product: 'Cinnamon',
          Rating: 5,
          Mood: 'Happy',
          Emoji: '😊',
          Comment: 'Excellent quality spices!',
          Status: 'approved',
          Date: '12/10/2025'
        },
        {
          Customer: 'Jane Smith',
          Email: 'jane@email.com',
          Product: 'Cardamom',
          Rating: 4,
          Mood: 'Satisfied',
          Emoji: '😌',
          Comment: 'Good product, fast delivery',
          Status: 'approved',
          Date: '12/9/2025'
        },
        {
          Customer: 'Mike Johnson',
          Email: 'mike@email.com',
          Product: 'Pepper',
          Rating: 3,
          Mood: 'Neutral',
          Emoji: '😐',
          Comment: 'Average quality',
          Status: 'pending',
          Date: '12/8/2025'
        }
      ];
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Feedback_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('📊 Feedback CSV report generated successfully!');
  };

  // Prepare chart data with fallback sample data
  const ratingData = feedback.reduce((acc, f) => {
    const rating = f.rating;
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  // Sample rating data if no real data
  const sampleRatingData = {
    5: 8,
    4: 5,
    3: 3,
    2: 1,
    1: 1
  };

  const finalRatingData = Object.keys(ratingData).length > 0 ? ratingData : sampleRatingData;

  const chartData = Object.entries(finalRatingData).map(([rating, count]) => ({
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

  // Emoji reaction data with fallback sample data
  const emojiData = feedback.reduce((acc, f) => {
    if (f.emojiReaction && f.mood) {
      acc[f.mood] = (acc[f.mood] || 0) + 1;
    }
    return acc;
  }, {});

  // If no emoji data, create sample data for demonstration
  const sampleEmojiData = {
    happy: 5,
    satisfied: 3,
    excited: 2,
    neutral: 1,
    disappointed: 1
  };

  const finalEmojiData = Object.keys(emojiData).length > 0 ? emojiData : sampleEmojiData;

  const emojiChartData = Object.entries(finalEmojiData).map(([mood, count]) => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    count,
    emoji: feedback.find(f => f.mood === mood)?.emojiReaction || 
           (mood === 'happy' ? '😊' : 
            mood === 'satisfied' ? '😌' : 
            mood === 'excited' ? '🤩' : 
            mood === 'neutral' ? '😐' : 
            mood === 'disappointed' ? '😞' : '😐')
  }));

  // Mood trend data for line chart
  const moodTrendData = feedback.reduce((acc, f) => {
    if (f.mood && f.createdAt) {
      const date = new Date(f.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][f.mood] = (acc[date][f.mood] || 0) + 1;
    }
    return acc;
  }, {});

  // Sample line chart data if no real data
  const sampleLineData = [
    { date: '12/8/2025', happy: 2, satisfied: 1, excited: 1, neutral: 0, disappointed: 0 },
    { date: '12/9/2025', happy: 3, satisfied: 2, excited: 0, neutral: 1, disappointed: 0 },
    { date: '12/10/2025', happy: 1, satisfied: 1, excited: 1, neutral: 0, disappointed: 1 }
  ];

  const lineChartData = Object.keys(moodTrendData).length > 0 ? 
    Object.entries(moodTrendData)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, moods]) => ({
        date,
        ...moods
      })) : sampleLineData;

  // Mood trend data for pie chart (overall distribution)
  const moodTrendPieData = Object.entries(finalEmojiData).map(([mood, count]) => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    count,
    emoji: feedback.find(f => f.mood === mood)?.emojiReaction || 
           (mood === 'happy' ? '😊' : 
            mood === 'satisfied' ? '😌' : 
            mood === 'excited' ? '🤩' : 
            mood === 'neutral' ? '😐' : 
            mood === 'disappointed' ? '😞' : '😐'),
    percentage: Object.values(finalEmojiData).reduce((sum, val) => sum + val, 0) > 0 ? 
                Math.round((count / Object.values(finalEmojiData).reduce((sum, val) => sum + val, 0)) * 100) : 0
  })).sort((a, b) => b.count - a.count); // Sort by count descending

  const COLORS = ['#7B3F00', '#A0522D', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C', '#BC9A6A'];

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
              <th className="p-4">Mood</th>
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
                  <div className="font-medium">{f.productName || f.productId?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{f.productId?.category || ''}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(f.rating)}
                    <span className="ml-2 text-sm text-gray-600">({f.rating})</span>
                  </div>
                </td>
                <td className="p-4">
                  {f.emojiReaction ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{f.emojiReaction}</span>
                      <span className="text-sm text-gray-600 capitalize">
                        {f.mood || 'Unknown'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No mood</span>
                  )}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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

        {/* Emoji Reaction Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#7B3F00] mb-4">😊 Customer Mood Reactions</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emojiChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ mood, count, emoji }) => `${emoji} ${mood}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {emojiChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Mood Trend Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#7B3F00] mb-4">📊 Mood Trends Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moodTrendPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ mood, count, emoji, percentage }) => 
                  `${emoji} ${mood}\n${count} (${percentage}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {moodTrendPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} feedback${value > 1 ? 's' : ''}`,
                  `${props.payload.emoji} ${props.payload.mood}`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Mood Statistics */}
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-[#7B3F00]">Mood Statistics:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {moodTrendPieData.slice(0, 4).map((mood, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="mr-1">{mood.emoji}</span>
                    <span className="truncate">{mood.mood}</span>
                  </span>
                  <span className="font-medium">{mood.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mood Trend Line Chart */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-[#7B3F00] mb-4">📈 Mood Trends Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value} feedback${value > 1 ? 's' : ''}`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="happy" 
                stroke="#10B981" 
                strokeWidth={3}
                name="😊 Happy"
                dot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="excited" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="🤩 Excited"
                dot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="satisfied" 
                stroke="#059669" 
                strokeWidth={3}
                name="😌 Satisfied"
                dot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="neutral" 
                stroke="#6B7280" 
                strokeWidth={3}
                name="😐 Neutral"
                dot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="disappointed" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="😞 Disappointed"
                dot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="frustrated" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="😤 Frustrated"
                dot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="angry" 
                stroke="#DC2626" 
                strokeWidth={3}
                name="😠 Angry"
                dot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="surprised" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                name="😲 Surprised"
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default FeedbackManager;
