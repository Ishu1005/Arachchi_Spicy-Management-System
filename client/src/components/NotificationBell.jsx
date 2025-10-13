import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inventoryData, setInventoryData] = useState([]);

  // Fetch inventory data and check for low stock
  useEffect(() => {
    const fetchInventoryAndCheckStock = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory');
        const inventory = response.data;
        setInventoryData(inventory);
        
        // Check for low stock items
        const lowStockItems = inventory.filter(item => item.quantity <= 10);
        
        if (lowStockItems.length > 0) {
          const lowStockNotifications = lowStockItems.map(item => ({
            id: `low-stock-${item._id}`,
            title: "Low Stock Alert",
            message: `${item.name} is running low (${item.quantity} units remaining)`,
            time: "Just now",
            read: false,
            type: "inventory",
            priority: "high"
          }));
          
          setNotifications(prev => {
            // Remove old low stock notifications for these items
            const filtered = prev.filter(notif => 
              !notif.id.startsWith('low-stock-') || 
              lowStockItems.some(item => notif.id === `low-stock-${item._id}`)
            );
            
            // Add new low stock notifications
            const newNotifications = [...filtered];
            lowStockNotifications.forEach(newNotif => {
              if (!filtered.some(existing => existing.id === newNotif.id)) {
                newNotifications.push(newNotif);
              }
            });
            
            return newNotifications;
          });
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    // Initial fetch
    fetchInventoryAndCheckStock();
    
    // Set up interval to check every 30 seconds
    const interval = setInterval(fetchInventoryAndCheckStock, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Sample notifications data with smart delivery features
  useEffect(() => {
    const sampleNotifications = [
      {
        id: 1,
        title: "Smart Delivery Route Optimized",
        message: "Delivery route for today has been optimized. 15% time saved!",
        time: "2 minutes ago",
        read: false,
        type: "delivery",
        priority: "medium"
      },
      {
        id: 2,
        title: "Delivery Completed",
        message: "Order #12340 has been delivered successfully to Colombo 03",
        time: "1 hour ago",
        read: false,
        type: "delivery",
        priority: "low"
      },
      {
        id: 3,
        title: "Weather Alert",
        message: "Heavy rain predicted. Consider rescheduling outdoor deliveries",
        time: "3 hours ago",
        read: true,
        type: "weather",
        priority: "high"
      },
      {
        id: 4,
        title: "New Customer Registration",
        message: "Sarah Wilson has registered as a new customer",
        time: "5 hours ago",
        read: true,
        type: "customer",
        priority: "low"
      },
      {
        id: 5,
        title: "Smart Delivery Suggestion",
        message: "Bulk order detected. Suggesting express delivery for better customer satisfaction",
        time: "10 minutes ago",
        read: false,
        type: "delivery",
        priority: "medium"
      }
    ];
    
    setNotifications(prev => {
      const existingIds = prev.map(n => n.id);
      const newNotifications = sampleNotifications.filter(n => !existingIds.includes(n.id));
      return [...prev, ...newNotifications];
    });
  }, []);

  // Update unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'delivery':
        return '🚚';
      case 'inventory':
        return '⚠️';
      case 'customer':
        return '👤';
      case 'weather':
        return '🌧️';
      case 'smart':
        return '🤖';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') {
      return 'text-red-600';
    }
    
    switch (type) {
      case 'order':
        return 'text-blue-600';
      case 'delivery':
        return 'text-green-600';
      case 'inventory':
        return 'text-orange-600';
      case 'customer':
        return 'text-purple-600';
      case 'weather':
        return 'text-blue-500';
      case 'smart':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>;
      case 'medium':
        return <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>;
      case 'low':
        return <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-[#7B3F00] transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#7B3F00]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getPriorityBadge(notification.priority)}
                          <p className={`text-sm font-medium ${getNotificationColor(notification.type, notification.priority)}`}>
                            {notification.title}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full text-center text-sm text-[#7B3F00] hover:text-[#6A2C00]">
              View all notifications
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationBell;
