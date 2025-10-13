// In-memory inventory storage
let inventoryItems = [];
let nextInventoryId = 1;

// Notification system for low stock alerts
let notifications = [];
let nextNotificationId = 1;

// Function to check for low stock and create notifications
const checkLowStock = (item) => {
  const LOW_STOCK_THRESHOLD = 30;
  
  if (item.quantity <= LOW_STOCK_THRESHOLD) {
    // Check if notification already exists for this item
    const existingNotification = notifications.find(notif => 
      notif.itemId === item._id && notif.type === 'low_stock' && !notif.read
    );
    
    if (!existingNotification) {
      const notification = {
        _id: nextNotificationId++,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${item.name} is running low! Only ${item.quantity} units remaining.`,
        itemId: item._id,
        itemName: item.name,
        currentQuantity: item.quantity,
        threshold: LOW_STOCK_THRESHOLD,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      notifications.push(notification);
    }
  }
};

// Function to remove notifications when stock is replenished
const removeLowStockNotification = (item) => {
  const LOW_STOCK_THRESHOLD = 30;
  
  if (item.quantity > LOW_STOCK_THRESHOLD) {
    notifications = notifications.filter(notif => 
      !(notif.itemId === item._id && notif.type === 'low_stock' && !notif.read)
    );
  }
};

exports.createInventoryItem = async (req, res) => {
  try {
    const { name, quantity, price, category, supplier } = req.body;
    
    const newInventoryItem = {
      _id: nextInventoryId++,
      name,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      category,
      supplier,
      createdAt: new Date().toISOString()
    };
    
    inventoryItems.push(newInventoryItem);
    
    // Check for low stock notification
    checkLowStock(newInventoryItem);
    
    res.status(201).json(newInventoryItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllInventoryItems = async (req, res) => {
  try {
    const { search } = req.query;
    let filteredItems = inventoryItems;
    
    // Apply search filter if provided
    if (search) {
      filteredItems = inventoryItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filteredItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const itemIndex = inventoryItems.findIndex(item => item._id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const oldItem = inventoryItems[itemIndex];
    inventoryItems[itemIndex] = { ...inventoryItems[itemIndex], ...req.body };
    
    // Check for low stock notification after update
    checkLowStock(inventoryItems[itemIndex]);
    removeLowStockNotification(inventoryItems[itemIndex]);
    
    res.json(inventoryItems[itemIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const itemIndex = inventoryItems.findIndex(item => item._id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Remove related notifications when item is deleted
    notifications = notifications.filter(notif => notif.itemId !== id);

    inventoryItems.splice(itemIndex, 1);
    res.json({ msg: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Notification API endpoints
exports.getAllNotifications = async (req, res) => {
  try {
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnreadNotifications = async (req, res) => {
  try {
    const unreadNotifications = notifications.filter(notif => !notif.read);
    res.json(unreadNotifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const notificationIndex = notifications.findIndex(notif => notif._id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notifications[notificationIndex].read = true;
    res.json(notifications[notificationIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    notifications.forEach(notif => {
      notif.read = true;
    });
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotificationCount = async (req, res) => {
  try {
    const unreadCount = notifications.filter(notif => !notif.read).length;
    res.json({ count: unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
