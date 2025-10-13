// Analytics controller for chart data
const orderController = require('./orderController');

// Sample orders data for analytics (same as orderController)
let orders = [
  {
    _id: 1,
    items: [
      { name: 'Cinnamon', quantity: 2, category: 'Spices' },
      { name: 'Cardamom', quantity: 1, category: 'Spices' },
      { name: 'Black Pepper', quantity: 1, category: 'Spices' }
    ],
    customerName: 'Kamal Perera',
    orderDate: '2024-01-15T10:00:00Z',
    status: 'completed'
  },
  {
    _id: 2,
    items: [
      { name: 'Pepper', quantity: 3, category: 'Spices' },
      { name: 'Turmeric', quantity: 1, category: 'Spices' },
      { name: 'Cumin', quantity: 2, category: 'Spices' }
    ],
    customerName: 'Nimal Fernando',
    orderDate: '2024-01-16T14:30:00Z',
    status: 'processing'
  },
  {
    _id: 3,
    items: [
      { name: 'Cloves', quantity: 1, category: 'Spices' },
      { name: 'Nutmeg', quantity: 2, category: 'Spices' }
    ],
    customerName: 'Sunil Rajapaksha',
    orderDate: '2024-01-17T09:15:00Z',
    status: 'completed'
  },
  {
    _id: 4,
    items: [
      { name: 'Cinnamon', quantity: 1, category: 'Spices' },
      { name: 'Ginger', quantity: 3, category: 'Spices' }
    ],
    customerName: 'Kamal Perera',
    orderDate: '2024-01-18T11:20:00Z',
    status: 'pending'
  },
  {
    _id: 5,
    items: [
      { name: 'Cardamom', quantity: 2, category: 'Spices' },
      { name: 'Star Anise', quantity: 1, category: 'Spices' },
      { name: 'Bay Leaves', quantity: 1, category: 'Spices' }
    ],
    customerName: 'Priya Silva',
    orderDate: '2024-01-19T15:45:00Z',
    status: 'completed'
  },
  {
    _id: 6,
    items: [
      { name: 'Turmeric', quantity: 2, category: 'Spices' },
      { name: 'Coriander', quantity: 1, category: 'Spices' }
    ],
    customerName: 'Ajith Kumar',
    orderDate: '2024-01-20T08:30:00Z',
    status: 'processing'
  }
];

// Get orders data
const getOrdersData = () => {
  console.log('Analytics: Getting orders data, count:', orders.length);
  return orders;
};

exports.getSalesBySpiceType = async (req, res) => {
  try {
    const orders = getOrdersData();
    console.log('Sales by spice type - orders count:', orders.length);
    const spiceSales = {};
    
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const spiceType = item.category || 'Uncategorized';
          if (!spiceSales[spiceType]) {
            spiceSales[spiceType] = 0;
          }
          spiceSales[spiceType] += item.quantity;
        });
      }
    });
    
    console.log('Spice sales data:', spiceSales);

    const chartData = {
      labels: Object.keys(spiceSales),
      datasets: [{
        label: 'Sales by Spice Type',
        data: Object.values(spiceSales),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        borderWidth: 1
      }]
    };

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerOrderFrequency = async (req, res) => {
  try {
    const orders = getOrdersData();
    const customerOrders = {};
    
    orders.forEach(order => {
      const customer = order.customerName || 'Anonymous';
      if (!customerOrders[customer]) {
        customerOrders[customer] = 0;
      }
      customerOrders[customer]++;
    });

    // Sort by frequency and take top 10
    const sortedCustomers = Object.entries(customerOrders)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const chartData = {
      labels: sortedCustomers.map(([name]) => name),
      datasets: [{
        label: 'Order Frequency',
        data: sortedCustomers.map(([,count]) => count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMonthlyOrderTrend = async (req, res) => {
  try {
    const orders = getOrdersData();
    const monthlyOrders = {};
    
    orders.forEach(order => {
      if (order.orderDate) {
        const date = new Date(order.orderDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyOrders[monthKey]) {
          monthlyOrders[monthKey] = 0;
        }
        monthlyOrders[monthKey]++;
      }
    });

    // Sort by month
    const sortedMonths = Object.entries(monthlyOrders)
      .sort(([a], [b]) => a.localeCompare(b));

    const chartData = {
      labels: sortedMonths.map(([month]) => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
      }),
      datasets: [{
        label: 'Monthly Orders',
        data: sortedMonths.map(([,count]) => count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      }]
    };

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderStatusDistribution = async (req, res) => {
  try {
    const orders = getOrdersData();
    const statusCount = {};
    
    orders.forEach(order => {
      const status = order.status || 'pending';
      if (!statusCount[status]) {
        statusCount[status] = 0;
      }
      statusCount[status]++;
    });

    const chartData = {
      labels: Object.keys(statusCount),
      datasets: [{
        label: 'Order Status Distribution',
        data: Object.values(statusCount),
        backgroundColor: [
          '#FF6384', // pending - red
          '#36A2EB', // processing - blue
          '#4BC0C0', // completed - teal
          '#FFCE56'  // cancelled - yellow
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#4BC0C0',
          '#FFCE56'
        ],
        borderWidth: 1
      }]
    };

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Function to sync with orders array (should be called when orders change)
exports.syncOrders = (ordersArray) => {
  orders = ordersArray;
};
