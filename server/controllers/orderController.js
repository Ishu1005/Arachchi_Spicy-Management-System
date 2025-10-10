// In-memory orders storage
let orders = [];
let nextOrderId = 1;

exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, deliveryMethod, address, customerName, customerContact } = req.body;

    const newOrder = {
      _id: nextOrderId++,
      items,
      paymentMethod,
      deliveryMethod,
      address,
      customerName,
      customerContact,
      createdBy: req.session.user.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
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
    res.json({ msg: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
