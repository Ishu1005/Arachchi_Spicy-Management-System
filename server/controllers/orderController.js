// In-memory orders storage
let orders = [
  // Sample orders with Sri Lankan addresses for testing
  {
    _id: 1,
    items: [
      { name: 'Cinnamon', quantity: 2, category: 'Spices' },
      { name: 'Cardamom', quantity: 1, category: 'Spices' },
      { name: 'Black Pepper', quantity: 1, category: 'Spices' }
    ],
    paymentMethod: 'Cash on Delivery',
    deliveryMethod: 'Standard Delivery',
    address: '123 Main Street, Colombo 03, Sri Lanka',
    customerName: 'Kamal Perera',
    customerContact: '0712345678',
    orderDate: '2024-01-15T10:00:00Z',
    orderTime: '14:30',
    status: 'completed',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: 2,
    items: [
      { name: 'Pepper', quantity: 3, category: 'Spices' },
      { name: 'Turmeric', quantity: 1, category: 'Spices' },
      { name: 'Cumin', quantity: 2, category: 'Spices' }
    ],
    paymentMethod: 'Credit Card',
    deliveryMethod: 'Express Delivery',
    address: '456 Temple Road, Kandy, Central Province, Sri Lanka',
    customerName: 'Nimal Fernando',
    customerContact: '0779876543',
    orderDate: '2024-01-16T14:30:00Z',
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
    orderDate: '2024-01-17T09:15:00Z',
    orderTime: '16:45',
    status: 'completed',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: 4,
    items: [
      { name: 'Cinnamon', quantity: 1, category: 'Spices' },
      { name: 'Ginger', quantity: 3, category: 'Spices' }
    ],
    paymentMethod: 'Cash on Delivery',
    deliveryMethod: 'Standard Delivery',
    address: '321 Galle Road, Mount Lavinia, Sri Lanka',
    customerName: 'Kamal Perera',
    customerContact: '0712345678',
    orderDate: '2024-01-18T11:20:00Z',
    orderTime: '11:20',
    status: 'pending',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: 5,
    items: [
      { name: 'Cardamom', quantity: 2, category: 'Spices' },
      { name: 'Star Anise', quantity: 1, category: 'Spices' },
      { name: 'Bay Leaves', quantity: 1, category: 'Spices' }
    ],
    paymentMethod: 'Credit Card',
    deliveryMethod: 'Express Delivery',
    address: '654 Negombo Road, Wattala, Sri Lanka',
    customerName: 'Priya Silva',
    customerContact: '0771234567',
    orderDate: '2024-01-19T15:45:00Z',
    orderTime: '15:45',
    status: 'completed',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    _id: 6,
    items: [
      { name: 'Turmeric', quantity: 2, category: 'Spices' },
      { name: 'Coriander', quantity: 1, category: 'Spices' }
    ],
    paymentMethod: 'Bank Transfer',
    deliveryMethod: 'Pickup Point',
    address: '987 High Level Road, Nugegoda, Sri Lanka',
    customerName: 'Ajith Kumar',
    customerContact: '0709876543',
    orderDate: '2024-01-20T08:30:00Z',
    orderTime: '08:30',
    status: 'processing',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  }
];
let nextOrderId = 7;

// Share orders data with analytics controller
global.sharedOrders = orders;

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
      status: 'pending',
      createdBy: req.session.user.id,
      createdAt: now.toISOString()
    };

    orders.push(newOrder);
    global.sharedOrders = orders; // Update shared data
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

    orders[orderIndex] = { ...order, ...req.body };
    global.sharedOrders = orders; // Update shared data
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
    global.sharedOrders = orders; // Update shared data
    res.json({ msg: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
