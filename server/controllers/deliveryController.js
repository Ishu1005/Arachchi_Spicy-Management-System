// In-memory delivery storage
let deliveries = [];
let nextDeliveryId = 1;

// Generate unique tracking number
const generateTrackingNumber = () => {
  return 'TRK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// AI-based delivery time prediction
const predictDeliveryTime = (address) => {
  // Simulate AI prediction based on address analysis
  const baseTime = 30; // Base delivery time in minutes
  const distanceFactor = Math.random() * 20 + 10; // Simulate distance calculation
  const trafficFactor = Math.random() * 15 + 5; // Simulate traffic conditions
  const weatherFactor = Math.random() * 10 + 5; // Simulate weather impact
  
  return Math.round(baseTime + distanceFactor + trafficFactor + weatherFactor);
};

// Smart notification system
const sendDeliveryNotification = (deliveryId, status) => {
  const notifications = {
    'pending': '📦 Your order is being prepared for delivery.',
    'in_transit': '🚚 Your delivery is on the way!',
    'delivered': '✅ Delivered successfully!',
    'failed': '❌ Delivery failed. Please contact support.'
  };

  const message = notifications[status] || 'Delivery status updated.';
  console.log(`Smart Notification: ${message}`);
  
  // In a real system, this would send SMS/Email
  return message;
};

exports.createDelivery = async (req, res) => {
  try {
    const { 
      orderId, 
      address,
      deliveryMethod,
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

    // AI prediction for delivery time
    const predictedTime = address ? predictDeliveryTime(address) : 45;
    
    const trackingNumber = generateTrackingNumber();
    const newDelivery = {
      _id: nextDeliveryId++,
      orderId: parseInt(orderId),
      address: address || deliveryAddress,
      deliveryMethod: deliveryMethod || 'Standard',
      predictedTime,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    deliveries.push(newDelivery);
    
    // Send initial notification
    sendDeliveryNotification(newDelivery._id, 'pending');
    
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

    const { 
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
      estimatedDeliveryTime,
      status
    } = req.body;

    // Validate required fields
    if (customerName && customerName.trim() === '') {
      return res.status(400).json({ error: 'Customer name cannot be empty' });
    }
    
    if (customerEmail && !customerEmail.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (customerPhone && customerPhone.trim() === '') {
      return res.status(400).json({ error: 'Customer phone cannot be empty' });
    }

    if (deliveryAddress && deliveryAddress.trim() === '') {
      return res.status(400).json({ error: 'Delivery address cannot be empty' });
    }

    if (deliveryCity && deliveryCity.trim() === '') {
      return res.status(400).json({ error: 'Delivery city cannot be empty' });
    }

    if (deliveryState && deliveryState.trim() === '') {
      return res.status(400).json({ error: 'Delivery state cannot be empty' });
    }

    if (deliveryZipCode && deliveryZipCode.trim() === '') {
      return res.status(400).json({ error: 'Delivery zip code cannot be empty' });
    }

    if (deliveryDate && isNaN(new Date(deliveryDate).getTime())) {
      return res.status(400).json({ error: 'Invalid delivery date format' });
    }

    if (status && !['pending', 'in_transit', 'delivered', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: pending, in_transit, delivered, failed' });
    }

    // Update delivery with validation
    const updatedDelivery = {
      ...deliveries[deliveryIndex],
      ...(customerName && { customerName: customerName.trim() }),
      ...(customerEmail && { customerEmail: customerEmail.trim() }),
      ...(customerPhone && { customerPhone: customerPhone.trim() }),
      ...(deliveryAddress && { deliveryAddress: deliveryAddress.trim() }),
      ...(deliveryCity && { deliveryCity: deliveryCity.trim() }),
      ...(deliveryState && { deliveryState: deliveryState.trim() }),
      ...(deliveryZipCode && { deliveryZipCode: deliveryZipCode.trim() }),
      ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
      ...(deliveryNotes && { deliveryNotes: deliveryNotes.trim() }),
      ...(deliveryPerson && { deliveryPerson: deliveryPerson.trim() }),
      ...(estimatedDeliveryTime && { estimatedDeliveryTime: estimatedDeliveryTime.trim() }),
      ...(status && { status }),
      updatedAt: new Date().toISOString()
    };

    deliveries[deliveryIndex] = updatedDelivery;

    // Send notification if status changed
    if (status && status !== deliveries[deliveryIndex].status) {
      sendDeliveryNotification(id, status);
    }
    
    res.json({
      message: 'Delivery updated successfully',
      delivery: updatedDelivery
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validate ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid delivery ID' });
    }
    
    const deliveryIndex = deliveries.findIndex(d => d._id === id);
    
    if (deliveryIndex === -1) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Get delivery details before deletion for response
    const deletedDelivery = deliveries[deliveryIndex];
    
    // Check if delivery is in progress (optional business rule)
    if (deletedDelivery.status === 'in_transit') {
      return res.status(400).json({ 
        error: 'Cannot delete delivery that is currently in transit. Please update status first.' 
      });
    }

    // Remove delivery from array
    deliveries.splice(deliveryIndex, 1);
    
    // Send notification about deletion
    console.log(`Delivery ${id} deleted successfully. Customer: ${deletedDelivery.customerName}`);
    
    res.json({ 
      message: 'Delivery deleted successfully',
      deletedDelivery: {
        id: deletedDelivery._id,
        customerName: deletedDelivery.customerName,
        trackingNumber: deletedDelivery.trackingNumber,
        status: deletedDelivery.status
      }
    });
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

    deliveries[deliveryIndex] = { 
      ...deliveries[deliveryIndex], 
      status,
      updatedAt: new Date().toISOString()
    };
    
    // Send smart notification
    const notificationMessage = sendDeliveryNotification(id, status);
    
    res.json({
      ...deliveries[deliveryIndex],
      notificationMessage
    });
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

// Smart Delivery Analytics (Admin Only)
exports.getDeliveryAnalytics = async (req, res) => {
  try {
    const totalDeliveries = deliveries.length;
    const onTimeDeliveries = deliveries.filter(d => d.status === 'delivered').length;
    const lateDeliveries = deliveries.filter(d => d.status === 'failed').length;
    const averageDeliveryTime = deliveries.reduce((sum, d) => sum + (d.predictedTime || 45), 0) / totalDeliveries || 45;
    
    // Top regions analysis
    const regionStats = {};
    deliveries.forEach(delivery => {
      const region = delivery.address || delivery.deliveryCity || 'Unknown';
      if (!regionStats[region]) {
        regionStats[region] = { deliveries: 0, totalTime: 0 };
      }
      regionStats[region].deliveries++;
      regionStats[region].totalTime += delivery.predictedTime || 45;
    });
    
    const topRegions = Object.entries(regionStats)
      .map(([region, stats]) => ({
        region,
        deliveries: stats.deliveries,
        avgTime: Math.round(stats.totalTime / stats.deliveries)
      }))
      .sort((a, b) => b.deliveries - a.deliveries)
      .slice(0, 5);
    
    // Performance trend (last 4 months)
    const performanceTrend = [
      { month: 'Jan', onTime: Math.floor(onTimeDeliveries * 0.9), late: Math.floor(lateDeliveries * 0.1) },
      { month: 'Feb', onTime: Math.floor(onTimeDeliveries * 0.95), late: Math.floor(lateDeliveries * 0.05) },
      { month: 'Mar', onTime: Math.floor(onTimeDeliveries * 0.85), late: Math.floor(lateDeliveries * 0.15) },
      { month: 'Apr', onTime: onTimeDeliveries, late: lateDeliveries }
    ];
    
    const analytics = {
      totalDeliveries,
      onTimeDeliveries,
      lateDeliveries,
      averageDeliveryTime: Math.round(averageDeliveryTime),
      topRegions,
      performanceTrend,
      successRate: totalDeliveries > 0 ? Math.round((onTimeDeliveries / totalDeliveries) * 100) : 0
    };
    
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// AI Prediction Endpoint
exports.predictDeliveryTime = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required for prediction' });
    }
    
    const predictedTime = predictDeliveryTime(address);
    
    res.json({
      address,
      predictedTime,
      confidence: Math.floor(Math.random() * 20 + 80), // 80-100% confidence
      factors: {
        distance: Math.floor(Math.random() * 20 + 10),
        traffic: Math.floor(Math.random() * 15 + 5),
        weather: Math.floor(Math.random() * 10 + 5)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
