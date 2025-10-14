// Import analytics controller for data sync
const { syncOrders } = require('./analyticsController');

// In-memory orders storage
let orders = [
  // Sample orders with Sri Lankan addresses for testing
  {
    _id: 1,
    items: [
      { name: 'Cinnamon', quantity: 2, category: 'Spices' },
      { name: 'Cardamom', quantity: 1, category: 'Spices' }
    ],
    paymentMethod: 'Cash on Delivery',
    deliveryMethod: 'Standard Delivery',
    address: '123 Main Street, Colombo 03, Sri Lanka',
    customerName: 'Kamal Perera',
    customerContact: '0712345678',
    orderDate: new Date().toISOString(),
    orderTime: '14:30',
    status: 'pending',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: 2,
    items: [
      { name: 'Pepper', quantity: 3, category: 'Spices' },
      { name: 'Turmeric', quantity: 1, category: 'Spices' }
    ],
    paymentMethod: 'Credit Card',
    deliveryMethod: 'Express Delivery',
    address: '456 Temple Road, Kandy, Central Province, Sri Lanka',
    customerName: 'Nimal Fernando',
    customerContact: '0779876543',
    orderDate: new Date().toISOString(),
    orderTime: '10:15',
    status: 'processing',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: 3,
    items: [
      { name: 'Cloves', quantity: 1, category: 'Spices' },
      { name: 'Nutmeg', quantity: 2, category: 'Spices' }
    ],
    paymentMethod: 'Bank Transfer',
    deliveryMethod: 'Pickup Point',
    address: '789 Beach Road, Galle, Southern Province, Sri Lanka',
    customerName: 'Sunil Rajapaksha',
    customerContact: '0701122334',
    orderDate: new Date().toISOString(),
    orderTime: '16:45',
    status: 'completed',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  }
];
let nextOrderId = 4;

exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, deliveryMethod, address, customerName, customerContact, orderDate, orderTime } = req.body;

    const now = new Date();
    const orderDateTime = orderDate ? new Date(orderDate) : now;
    const timeString = orderTime || now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    // Only validate date (not time)
    if (orderDate) {
      const selectedDate = new Date(orderDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      selectedDate.setHours(0, 0, 0, 0); // Reset time to start of day

      if (selectedDate < today) {
        return res.status(400).json({
          error: 'Order date cannot be in the past. Please select today or a future date.'
        });
      }
    }

    // Handle uploaded image
    let productImage = null;
    if (req.file) {
      productImage = req.file.filename;
    }

    const newOrder = {
      _id: nextOrderId++,
      items,
      paymentMethod,
      deliveryMethod,
      address,
      customerName,
      customerContact,
      orderDate: orderDateTime.toISOString(),
      orderTime: timeString,
      productImage, // Add the uploaded image filename
      status: 'pending',
      createdBy: req.session.user.id,
      createdAt: now.toISOString()
    };

    orders.push(newOrder);
    syncOrders(orders); // Sync with analytics
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Only return current user's orders unless user is admin
exports.getAllOrders = async (req, res) => {
  try {
    const user = req.session.user;
    let filteredOrders = orders;
    
    // Filter by user unless admin
    if (user.role !== 'admin') {
      filteredOrders = orders.filter(order => order.createdBy.toString() === user.id);
    }
    
    res.json(filteredOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o._id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const order = orders[orderIndex];
    const user = req.session.user;
    
    if (order.createdBy.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized to update this order' });
    }

    // Handle uploaded image
    let productImage = order.productImage; // Keep existing image by default
    if (req.file) {
      productImage = req.file.filename;
    }

    orders[orderIndex] = { 
      ...order, 
      ...req.body,
      productImage // Update with new image if provided
    };
    syncOrders(orders); // Sync with analytics
    res.json(orders[orderIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o._id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const order = orders[orderIndex];
    const user = req.session.user;
    
    if (order.createdBy.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized to delete this order' });
    }

    orders.splice(orderIndex, 1);
    syncOrders(orders); // Sync with analytics
    res.json({ msg: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Initialize analytics sync with current orders
syncOrders(orders);
