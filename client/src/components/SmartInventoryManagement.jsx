import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  TruckIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

function SmartInventoryManagement({ inventoryItems = [], orders = [] }) {
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [stockPredictions, setStockPredictions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // 🔄 Auto Stock Update - Real-time monitoring
  useEffect(() => {
    checkLowStock();
    checkExpiryDates();
    generateStockPredictions();
    generateReorderSuggestions();
  }, [inventoryItems, orders]);

  // 📊 Check for low stock items (quantity <= 10)
  const checkLowStock = () => {
    const lowStock = inventoryItems
      .filter(item => item.quantity <= 10)
      .map(item => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        message: `⚠️ Low stock alert: ${item.name} (${item.quantity} kg left)`,
        priority: item.quantity <= 5 ? 'high' : 'medium'
      }));
    setLowStockAlerts(lowStock);
  };

  // 🧾 Expiry Date Tracking (simulated)
  const checkExpiryDates = () => {
    const nearExpiry = inventoryItems
      .filter(item => item.quantity > 0) // Only check items with stock
      .map(item => ({
        id: item._id,
        name: item.name,
        expiryDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within 30 days
        daysLeft: Math.floor(Math.random() * 30),
        priority: Math.random() > 0.7 ? 'high' : 'medium'
      }))
      .filter(item => item.daysLeft <= 7)
      .map(item => ({
        ...item,
        message: `🧾 Expiry alert: ${item.name} expires in ${item.daysLeft} days`
      }));
    setExpiryAlerts(nearExpiry);
  };

  // 📊 AI-Based Stock Prediction
  const generateStockPredictions = () => {
    const predictions = inventoryItems.map(item => {
      // Simulate AI analysis based on sales trends
      const avgDailyUsage = Math.random() * 5 + 1; // Random daily usage
      const daysUntilReorder = Math.floor(item.quantity / avgDailyUsage);
      
      return {
        name: item.name,
        currentStock: item.quantity,
        avgDailyUsage: avgDailyUsage.toFixed(1),
        daysUntilReorder: daysUntilReorder,
        prediction: daysUntilReorder <= 7 ? 'Reorder Soon' : daysUntilReorder <= 14 ? 'Monitor Closely' : 'Stock Adequate',
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };
    });
    setStockPredictions(predictions);
  };

  // 🧠 Smart Reorder Suggestions
  const generateReorderSuggestions = () => {
    const suggestions = lowStockAlerts.map(alert => {
      const suppliers = ['Arachchi Suppliers', 'Premium Spice Co.', 'Ceylon Spice Hub', 'Golden Spice Ltd'];
      const selectedSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      
      return {
        ...alert,
        suggestedSupplier: selectedSupplier,
        deliveryTime: Math.floor(Math.random() * 5) + 1, // 1-5 days
        quality: Math.random() > 0.3 ? 'Excellent' : 'Good',
        price: (Math.random() * 500 + 200).toFixed(2),
        suggestion: `Suggests reorder from "${selectedSupplier}"`
      };
    });
    setReorderSuggestions(suggestions);
  };

  // 📊 Generate analytics data
  const getAnalyticsData = () => {
    const categories = [...new Set(inventoryItems.map(item => item.category))];
    const categoryData = categories.map(category => {
      const items = inventoryItems.filter(item => item.category === category);
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const lowStockCount = items.filter(item => item.quantity <= 10).length;
      
      return {
        category,
        totalQuantity,
        lowStockCount,
        items: items.length
      };
    });

    return categoryData;
  };

  const getStockTrendData = () => {
    // Simulate 7 days of stock data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      stock: Math.floor(Math.random() * 100) + 50,
      sales: Math.floor(Math.random() * 20) + 5
    }));
  };

  const analyticsData = getAnalyticsData();
  const trendData = getStockTrendData();
  const totalAlerts = lowStockAlerts.length + expiryAlerts.length;

  const COLORS = ['#7B3F00', '#D6A77A', '#F4E4BC', '#8B4513', '#CD853F'];

  return (
    <div className="space-y-6">
      {/* 🔔 Notification Bell */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md border border-amber-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BellIcon className="h-8 w-8 text-[#7B3F00]" />
            {totalAlerts > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalAlerts}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#7B3F00]">Smart Inventory Alerts</h3>
            <p className="text-sm text-gray-600">
              {totalAlerts > 0 ? `${totalAlerts} active alerts` : 'All systems normal'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="bg-[#7B3F00] text-white px-4 py-2 rounded-lg hover:bg-[#5C2C00] transition-colors"
        >
          {showNotifications ? 'Hide' : 'View'} Alerts
        </button>
      </div>

      {/* 🔔 Alerts Panel */}
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg shadow-md border border-amber-200 p-4"
        >
          <h4 className="text-lg font-semibold text-[#7B3F00] mb-4">Active Alerts</h4>
          
          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-red-600 mb-2">Low Stock Alerts</h5>
              {lowStockAlerts.map(alert => (
                <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  {reorderSuggestions.find(s => s.id === alert.id) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {reorderSuggestions.find(s => s.id === alert.id).suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Expiry Alerts */}
          {expiryAlerts.length > 0 && (
            <div>
              <h5 className="font-medium text-orange-600 mb-2">Expiry Alerts</h5>
              {expiryAlerts.map(alert => (
                <div key={alert.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-orange-500" />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalAlerts === 0 && (
            <p className="text-gray-500 text-center py-4">No active alerts</p>
          )}
        </motion.div>
      )}

      {/* 📊 Smart Inventory Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Category */}
        <div className="bg-white rounded-lg shadow-md border border-amber-200 p-4">
          <h4 className="text-lg font-semibold text-[#7B3F00] mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Stock by Category
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalQuantity" fill="#7B3F00" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Trend */}
        <div className="bg-white rounded-lg shadow-md border border-amber-200 p-4">
          <h4 className="text-lg font-semibold text-[#7B3F00] mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            Stock Trend (7 Days)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="stock" stroke="#7B3F00" strokeWidth={2} />
              <Line type="monotone" dataKey="sales" stroke="#D6A77A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🧠 AI Predictions & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Predictions */}
        <div className="bg-white rounded-lg shadow-md border border-amber-200 p-4">
          <h4 className="text-lg font-semibold text-[#7B3F00] mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            AI Stock Predictions
          </h4>
          <div className="space-y-3">
            {stockPredictions.slice(0, 5).map((prediction, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{prediction.name}</span>
                  <div className="flex items-center space-x-1">
                    {prediction.trend === 'up' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      prediction.prediction === 'Reorder Soon' ? 'bg-red-100 text-red-700' :
                      prediction.prediction === 'Monitor Closely' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {prediction.prediction}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Current: {prediction.currentStock}kg | Daily Usage: {prediction.avgDailyUsage}kg | 
                  Reorder in: {prediction.daysUntilReorder} days
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reorder Suggestions */}
        <div className="bg-white rounded-lg shadow-md border border-amber-200 p-4">
          <h4 className="text-lg font-semibold text-[#7B3F00] mb-4 flex items-center">
            <TruckIcon className="h-5 w-5 mr-2" />
            Smart Reorder Suggestions
          </h4>
          <div className="space-y-3">
            {reorderSuggestions.slice(0, 5).map((suggestion, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{suggestion.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {suggestion.suggestedSupplier}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Delivery: {suggestion.deliveryTime} days | Quality: {suggestion.quality} | 
                  Price: Rs.{suggestion.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 Inventory Summary */}
      <div className="bg-white rounded-lg shadow-md border border-amber-200 p-4">
        <h4 className="text-lg font-semibold text-[#7B3F00] mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Inventory Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#7B3F00]">{inventoryItems.length}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{lowStockAlerts.length}</div>
            <div className="text-sm text-gray-600">Low Stock Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{expiryAlerts.length}</div>
            <div className="text-sm text-gray-600">Near Expiry</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Stock (kg)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartInventoryManagement;


