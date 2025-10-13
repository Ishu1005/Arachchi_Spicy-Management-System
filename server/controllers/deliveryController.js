// In-memory delivery storage
let deliveries = [];
let nextDeliveryId = 1;

// Generate unique tracking number
const generateTrackingNumber = () => {
  return 'TRK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

exports.createDelivery = async (req, res) => {
  try {
    const { 
      orderId, 
      customerName, 
      customerEmail, 
      customerPhone, 
      deliveryAddress, 
      deliveryCity, 
      deliveryState, 
      deliveryZipCode, 
      deliveryDate,
      deliveryNotes,
      deliveryPerson,
      estimatedDeliveryTime
    } = req.body;
    
    // Check if delivery already exists for this order
    const existingDelivery = deliveries.find(d => d.orderId === parseInt(orderId));
    if (existingDelivery) {
      return res.status(400).json({ error: 'Delivery already exists for this order' });
    }

    const trackingNumber = generateTrackingNumber();
    const newDelivery = {
      _id: nextDeliveryId++,
      orderId: parseInt(orderId),
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZipCode,
      deliveryDate,
      trackingNumber,
      deliveryNotes,
      deliveryPerson,
      estimatedDeliveryTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    deliveries.push(newDelivery);
    res.status(201).json(newDelivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    const { search, status, dateFrom, dateTo } = req.query;
    let filteredDeliveries = deliveries;
    
    // Apply filters
    if (search) {
      filteredDeliveries = filteredDeliveries.filter(d => 
        d.customerName.toLowerCase().includes(search.toLowerCase()) ||
        d.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
        d.deliveryCity.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status) {
      filteredDeliveries = filteredDeliveries.filter(d => d.status === status);
    }
    
    if (dateFrom || dateTo) {
      filteredDeliveries = filteredDeliveries.filter(d => {
        const deliveryDate = new Date(d.deliveryDate);
        if (dateFrom && deliveryDate < new Date(dateFrom)) return false;
        if (dateTo && deliveryDate > new Date(dateTo)) return false;
        return true;
      });
    }
    
    // Sort by creation date (newest first)
    filteredDeliveries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(filteredDeliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const delivery = deliveries.find(d => d._id === id);
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deliveryIndex = deliveries.findIndex(d => d._id === id);
    
    if (deliveryIndex === -1) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    deliveries[deliveryIndex] = { ...deliveries[deliveryIndex], ...req.body };
    res.json(deliveries[deliveryIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deliveryIndex = deliveries.findIndex(d => d._id === id);
    
    if (deliveryIndex === -1) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    deliveries.splice(deliveryIndex, 1);
    res.json({ msg: 'Delivery deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const validStatuses = ['pending', 'in_transit', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const deliveryIndex = deliveries.findIndex(d => d._id === id);
    if (deliveryIndex === -1) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    deliveries[deliveryIndex] = { ...deliveries[deliveryIndex], status };
    res.json(deliveries[deliveryIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDeliveryByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const delivery = deliveries.find(d => d.trackingNumber === trackingNumber);
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
