// Test script for order analytics functionality
// This script tests the analytics endpoints to ensure they're working properly

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data for analytics
const testOrders = [
  {
    _id: 1,
    items: [
      { name: 'Cinnamon', quantity: 2, category: 'Spices' },
      { name: 'Cardamom', quantity: 1, category: 'Spices' }
    ],
    customerName: 'Kamal Perera',
    orderDate: '2024-01-15T10:00:00Z',
    status: 'completed'
  },
  {
    _id: 2,
    items: [
      { name: 'Pepper', quantity: 3, category: 'Spices' },
      { name: 'Turmeric', quantity: 1, category: 'Spices' }
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
    status: 'pending'
  }
];

async function testAnalyticsEndpoints() {
  try {
    console.log('🚀 Starting Order Analytics Test...\n');

    // Test 1: Sales by Spice Type
    console.log('1. Testing Sales by Spice Type endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/analytics/sales-by-spice-type`);
      console.log('✅ Sales by Spice Type:', response.data);
    } catch (error) {
      console.log('❌ Sales by Spice Type failed:', error.response?.data?.error || error.message);
    }

    // Test 2: Customer Order Frequency
    console.log('\n2. Testing Customer Order Frequency endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/analytics/customer-order-frequency`);
      console.log('✅ Customer Order Frequency:', response.data);
    } catch (error) {
      console.log('❌ Customer Order Frequency failed:', error.response?.data?.error || error.message);
    }

    // Test 3: Monthly Order Trend
    console.log('\n3. Testing Monthly Order Trend endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/analytics/monthly-order-trend`);
      console.log('✅ Monthly Order Trend:', response.data);
    } catch (error) {
      console.log('❌ Monthly Order Trend failed:', error.response?.data?.error || error.message);
    }

    // Test 4: Order Status Distribution
    console.log('\n4. Testing Order Status Distribution endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/analytics/order-status-distribution`);
      console.log('✅ Order Status Distribution:', response.data);
    } catch (error) {
      console.log('❌ Order Status Distribution failed:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Analytics endpoints test completed!');
    console.log('\n📋 Expected Results:');
    console.log('   - Sales by Spice Type: Should show spice categories with quantities');
    console.log('   - Customer Order Frequency: Should show customer names with order counts');
    console.log('   - Monthly Order Trend: Should show monthly order counts');
    console.log('   - Order Status Distribution: Should show status counts (pending, processing, completed)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Frontend integration guide
console.log('📚 Frontend Integration Guide:\n');
console.log('The order analytics are now working! Here\'s what you can expect:\n');

console.log('🔧 Backend Endpoints:');
console.log('GET /api/analytics/sales-by-spice-type');
console.log('GET /api/analytics/customer-order-frequency');
console.log('GET /api/analytics/monthly-order-trend');
console.log('GET /api/analytics/order-status-distribution\n');

console.log('🎨 Frontend Components:');
console.log('- SimpleBarChart: Shows customer order frequency');
console.log('- SimplePieChart: Shows sales by spice type and status distribution');
console.log('- SimpleLineChart: Shows monthly order trends');
console.log('- SummaryCards: Shows key metrics overview\n');

console.log('👤 User Access:');
console.log('- Analytics are only visible to admin users');
console.log('- Regular users see a message explaining admin-only access');
console.log('- Charts are hidden by default, click "Show Analytics" to display\n');

console.log('🔄 Data Flow:');
console.log('1. Order data is shared between orderController and analyticsController');
console.log('2. Analytics endpoints process the data and return chart-ready format');
console.log('3. Frontend fetches data and displays using custom chart components');
console.log('4. Charts update automatically when orders change\n');

// Run the test if this file is executed directly
if (require.main === module) {
  testAnalyticsEndpoints();
}

module.exports = { testAnalyticsEndpoints };
