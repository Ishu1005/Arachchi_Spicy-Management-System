// Quick test to verify analytics endpoints
const axios = require('axios');

async function testAnalytics() {
  try {
    console.log('Testing analytics endpoints...');
    
    // Test sales by spice type
    const response = await axios.get('http://localhost:5000/api/analytics/sales-by-spice-type');
    console.log('Sales by spice type response:', response.data);
    
    // Test customer order frequency
    const response2 = await axios.get('http://localhost:5000/api/analytics/customer-order-frequency');
    console.log('Customer order frequency response:', response2.data);
    
    // Test monthly order trend
    const response3 = await axios.get('http://localhost:5000/api/analytics/monthly-order-trend');
    console.log('Monthly order trend response:', response3.data);
    
    // Test order status distribution
    const response4 = await axios.get('http://localhost:5000/api/analytics/order-status-distribution');
    console.log('Order status distribution response:', response4.data);
    
  } catch (error) {
    console.error('Error testing analytics:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAnalytics();
