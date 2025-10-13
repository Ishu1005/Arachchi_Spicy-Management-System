// Analytics controller for chart data
let orders = []; // This will be synced with orderController

exports.getSalesBySpiceType = async (req, res) => {
  try {
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
