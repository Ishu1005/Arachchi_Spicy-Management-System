import { useEffect, useState } from 'react';
import axios from 'axios';
import DeliveryForm from '../components/DeliveryForm';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon, 
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  ChartBarIcon,
  BellIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function DeliveryManager() {
  const [deliveries, setDeliveries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Fetch session user
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/auth/session', { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  // Fetch deliveries
  const fetchDeliveries = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/delivery?search=${search}`, {
        withCredentials: true
      });
      setDeliveries(res.data);
    } catch (err) {
      console.error('Error fetching deliveries:', err.response?.data || err.message);
      toast.error('Failed to load deliveries.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [search, user]);

  // Delivery Analytics (Admin Only)
  const fetchDeliveryAnalytics = async () => {
    try {
      // Simulate analytics data
      const analytics = {
        averageDeliveryTime: 45,
        totalDeliveries: deliveries.length,
        onTimeDeliveries: Math.floor(deliveries.length * 0.85),
        lateDeliveries: Math.floor(deliveries.length * 0.15),
        topRegions: [
          { region: 'Colombo', deliveries: 25, avgTime: 35 },
          { region: 'Gampaha', deliveries: 18, avgTime: 42 },
          { region: 'Kandy', deliveries: 15, avgTime: 55 },
          { region: 'Galle', deliveries: 12, avgTime: 48 }
        ],
        performanceTrend: [
          { month: 'Jan', onTime: 85, late: 15 },
          { month: 'Feb', onTime: 88, late: 12 },
          { month: 'Mar', onTime: 82, late: 18 },
          { month: 'Apr', onTime: 90, late: 10 }
        ]
      };
      
      setAnalyticsData(analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (deliveryId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/delivery/${deliveryId}/status`, { status }, {
        withCredentials: true
      });

      toast.success(`Delivery status updated to ${status}`);
      fetchDeliveries();
      
    } catch (err) {
      console.error('Error updating delivery status:', err.response?.data || err.message);
      toast.error('Failed to update delivery status');
    }
  };

  // Edit delivery
  const handleEditDelivery = (delivery) => {
    setEditing(delivery);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete delivery
  const handleDeleteDelivery = async (deliveryId, customerName) => {
    if (window.confirm(`Are you sure you want to delete the delivery for ${customerName}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/delivery/${deliveryId}`, {
          withCredentials: true
        });

        toast.success('Delivery deleted successfully');
        fetchDeliveries();
        
      } catch (err) {
        console.error('Error deleting delivery:', err.response?.data || err.message);
        toast.error(err.response?.data?.error || 'Failed to delete delivery');
      }
    }
  };

  // Generate Delivery Report
  const generateDeliveryReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('ARACHCHCHI SPICES', 14, 22);
    doc.setFontSize(16);
    doc.text('Smart Delivery Report', 14, 32);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
    
    // AI Prediction Summary
    doc.setFontSize(14);
    doc.text('AI Delivery Predictions:', 14, 50);
    doc.setFontSize(10);
    doc.text(`Average Predicted Time: ${analyticsData?.averageDeliveryTime || 45} minutes`, 14, 58);
    doc.text(`Total Deliveries: ${deliveries.length}`, 14, 66);
    doc.text(`On-Time Rate: ${analyticsData ? Math.round((analyticsData.onTimeDeliveries / analyticsData.totalDeliveries) * 100) : 85}%`, 14, 74);
    
    // Delivery Table
    const tableColumn = ['Order ID', 'Address', 'Method', 'Predicted Time', 'Status', 'Created'];
    const tableRows = deliveries.map(delivery => [
      delivery.orderId || '-',
      delivery.address,
      delivery.deliveryMethod || '-',
      delivery.predictedTime ? `${delivery.predictedTime} min` : '-',
      delivery.status,
      delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString() : '-'
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [123, 63, 0] },
    });
    
    doc.save(`Smart_Delivery_Report_${Date.now()}.pdf`);
    toast.success('Smart delivery report generated successfully!');
  };

  return (
    <div className="min-h-screen bg-[#fffaf2] overflow-x-hidden p-6">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center text-[#7B3F00] mb-6"
      >
        🚚 Smart Delivery Management
      </motion.h1>

      {/* Innovation Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        {/* Map Integration */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-[#D6A77A]">
          <div className="flex items-center mb-2">
            <MapPinIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="font-semibold text-[#7B3F00]">📍 Map Integration</h3>
          </div>
          <p className="text-sm text-gray-600">Sri Lanka district-based address selection</p>
        </div>

        {/* AI Prediction */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-[#D6A77A]">
          <div className="flex items-center mb-2">
            <ClockIcon className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="font-semibold text-[#7B3F00]">🤖 AI Prediction</h3>
          </div>
          <p className="text-sm text-gray-600">Smart delivery time estimation</p>
        </div>

        {/* Analytics */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-[#D6A77A]">
          <div className="flex items-center mb-2">
            <ChartBarIcon className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="font-semibold text-[#7B3F00]">📊 Analytics</h3>
          </div>
          <p className="text-sm text-gray-600">Performance insights & trends</p>
        </div>

        {/* Notifications */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-[#D6A77A]">
          <div className="flex items-center mb-2">
            <BellIcon className="h-6 w-6 text-orange-600 mr-2" />
            <h3 className="font-semibold text-[#7B3F00]">🔔 Smart Alerts</h3>
          </div>
          <p className="text-sm text-gray-600">Real-time delivery updates</p>
        </div>
      </motion.div>

      {/* Smart Delivery Form */}
      <DeliveryForm fetchDeliveries={fetchDeliveries} editing={editing} setEditing={setEditing} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-[#D6A77A]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search deliveries..."
            className="w-full pl-11 pr-4 py-2 rounded-lg border border-[#D6A77A] focus:outline-none focus:ring-2 focus:ring-[#7B3F00]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Analytics Button (Admin Only) */}
          {user && user.role === 'admin' && (
            <button
              onClick={() => {
                setShowAnalytics(!showAnalytics);
                if (!showAnalytics) {
                  fetchDeliveryAnalytics();
                }
              }}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ChartBarIcon className="h-5 w-5" />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
          )}

          {/* Report Button */}
          <button
            onClick={generateDeliveryReport}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Analytics Dashboard (Admin Only) */}
      {user && user.role === 'admin' && showAnalytics && analyticsData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-[#D6A77A]"
        >
          <h2 className="text-xl font-bold text-[#7B3F00] mb-4">📊 Delivery Performance Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Average Delivery Time</h3>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.averageDeliveryTime} min</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">On-Time Deliveries</h3>
              <p className="text-2xl font-bold text-green-600">{analyticsData.onTimeDeliveries}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">Late Deliveries</h3>
              <p className="text-2xl font-bold text-red-600">{analyticsData.lateDeliveries}</p>
            </div>
          </div>

          {/* Top Regions */}
          <div className="mb-6">
            <h3 className="font-semibold text-[#7B3F00] mb-3">Top Performing Regions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analyticsData.topRegions.map((region, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{region.region}</span>
                    <span className="text-sm text-gray-600">{region.deliveries} deliveries</span>
                  </div>
                  <div className="text-sm text-gray-500">Avg: {region.avgTime} min</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Deliveries Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <table className="w-full text-left">
          <thead className="bg-[#7B3F00] text-white">
            <tr>
              <th className="p-4 font-semibold">Order ID</th>
              <th className="p-4 font-semibold">Address</th>
              <th className="p-4 font-semibold">Agent</th>
              <th className="p-4 font-semibold">Driver Code</th>
              <th className="p-4 font-semibold">Method</th>
              <th className="p-4 font-semibold">ETA</th>
              <th className="p-4 font-semibold">Charge</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length > 0 ? (
              deliveries.map((delivery, index) => (
                <motion.tr
                  key={delivery._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-4 font-medium text-[#5C2C00]">{delivery.orderId || '-'}</td>
                  <td className="p-4 text-gray-600">{delivery.deliveryAddress || delivery.address || '-'}</td>
                  <td className="p-4 text-gray-600">{delivery.agentName || '-'}</td>
                  <td className="p-4 text-gray-600">{delivery.driverCode || '-'}</td>
                  <td className="p-4 text-gray-600">{delivery.deliveryMethod || '-'}</td>
                  <td className="p-4">
                    {delivery.estimatedTime ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {delivery.estimatedTime}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-4">
                    {delivery.deliveryCharge ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        Rs. {delivery.deliveryCharge}
                      </span>
                    ) : 'Free'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {delivery.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditDelivery(delivery)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit Delivery"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteDelivery(delivery._id, delivery.customerName || delivery.agentName || 'Unknown')}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Delivery"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Status Update Buttons */}
                      {delivery.status === 'pending' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery._id, 'in_transit')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Mark as In Transit"
                        >
                          <TruckIcon className="h-5 w-5" />
                        </button>
                      )}
                      
                      {delivery.status === 'in_transit' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery._id, 'delivered')}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Mark as Delivered"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-8 text-gray-500">
                  <div className="flex flex-col items-center gap-4">
                    <TruckIcon className="h-12 w-12 text-gray-300" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Deliveries Found</h3>
                      <p className="text-gray-500">Start by creating your first smart delivery.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

export default DeliveryManager;