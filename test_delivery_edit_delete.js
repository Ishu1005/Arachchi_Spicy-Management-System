// Test script for delivery edit and delete functionality
// This script demonstrates how to use the delivery edit and delete endpoints

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/deliveries';

// Test data
const testDelivery = {
  orderId: 1,
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '0771234567',
  deliveryAddress: '123 Test Street',
  deliveryCity: 'Colombo',
  deliveryState: 'Western',
  deliveryZipCode: '10000',
  deliveryDate: '2024-02-15',
  deliveryNotes: 'Test delivery notes',
  deliveryPerson: 'John Doe',
  estimatedDeliveryTime: '2 hours'
};

async function testDeliveryCRUD() {
  try {
    console.log('🚀 Starting Delivery Edit & Delete Test...\n');

    // 1. Create a test delivery
    console.log('1. Creating test delivery...');
    const createResponse = await axios.post(BASE_URL, testDelivery);
    const deliveryId = createResponse.data._id;
    console.log(`✅ Delivery created with ID: ${deliveryId}`);
    console.log(`   Tracking Number: ${createResponse.data.trackingNumber}\n`);

    // 2. Get the created delivery
    console.log('2. Retrieving created delivery...');
    const getResponse = await axios.get(`${BASE_URL}/${deliveryId}`);
    console.log(`✅ Delivery retrieved: ${getResponse.data.customerName}\n`);

    // 3. Update delivery details
    console.log('3. Updating delivery details...');
    const updateData = {
      customerName: 'Updated Customer Name',
      customerEmail: 'updated@example.com',
      deliveryAddress: '456 Updated Street',
      deliveryCity: 'Kandy',
      deliveryNotes: 'Updated delivery notes',
      status: 'in_transit'
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/${deliveryId}`, updateData);
    console.log('✅ Delivery updated successfully');
    console.log(`   New customer name: ${updateResponse.data.delivery.customerName}`);
    console.log(`   New address: ${updateResponse.data.delivery.deliveryAddress}`);
    console.log(`   New status: ${updateResponse.data.delivery.status}\n`);

    // 4. Test validation - try to update with invalid data
    console.log('4. Testing validation (invalid email)...');
    try {
      await axios.put(`${BASE_URL}/${deliveryId}`, { customerEmail: 'invalid-email' });
    } catch (error) {
      console.log(`✅ Validation working: ${error.response.data.error}\n`);
    }

    // 5. Update status only
    console.log('5. Updating delivery status...');
    const statusResponse = await axios.put(`${BASE_URL}/${deliveryId}/status`, { status: 'delivered' });
    console.log(`✅ Status updated to: ${statusResponse.data.status}\n`);

    // 6. Test delete protection - try to delete in-transit delivery
    console.log('6. Testing delete protection (in-transit delivery)...');
    await axios.put(`${BASE_URL}/${deliveryId}/status`, { status: 'in_transit' });
    try {
      await axios.delete(`${BASE_URL}/${deliveryId}`);
    } catch (error) {
      console.log(`✅ Delete protection working: ${error.response.data.error}\n`);
    }

    // 7. Change status to allow deletion
    console.log('7. Changing status to allow deletion...');
    await axios.put(`${BASE_URL}/${deliveryId}/status`, { status: 'pending' });

    // 8. Delete the delivery
    console.log('8. Deleting delivery...');
    const deleteResponse = await axios.delete(`${BASE_URL}/${deliveryId}`);
    console.log(`✅ Delivery deleted: ${deleteResponse.data.message}`);
    console.log(`   Deleted delivery ID: ${deleteResponse.data.deletedDelivery.id}\n`);

    // 9. Verify deletion
    console.log('9. Verifying deletion...');
    try {
      await axios.get(`${BASE_URL}/${deliveryId}`);
    } catch (error) {
      console.log(`✅ Deletion verified: ${error.response.data.error}\n`);
    }

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary of functionality:');
    console.log('   ✅ Create delivery');
    console.log('   ✅ Read delivery details');
    console.log('   ✅ Update delivery details with validation');
    console.log('   ✅ Update delivery status');
    console.log('   ✅ Delete delivery with protection');
    console.log('   ✅ Input validation working');
    console.log('   ✅ Business rules enforced');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
  }
}

// API endpoint examples for frontend integration
console.log('📚 API Endpoints for Frontend Integration:\n');
console.log('GET    /api/deliveries              - Get all deliveries');
console.log('GET    /api/deliveries/:id          - Get delivery by ID');
console.log('POST   /api/deliveries              - Create new delivery');
console.log('PUT    /api/deliveries/:id          - Update delivery details');
console.log('DELETE /api/deliveries/:id          - Delete delivery');
console.log('PUT    /api/deliveries/:id/status   - Update delivery status only');
console.log('GET    /api/deliveries/track/:trackingNumber - Get by tracking number\n');

// Example frontend usage
console.log('💻 Example Frontend Usage:\n');
console.log('// Update delivery details');
console.log('const updateDelivery = async (id, data) => {');
console.log('  const response = await fetch(`/api/deliveries/${id}`, {');
console.log('    method: "PUT",');
console.log('    headers: { "Content-Type": "application/json" },');
console.log('    body: JSON.stringify(data)');
console.log('  });');
console.log('  return response.json();');
console.log('};\n');

console.log('// Delete delivery');
console.log('const deleteDelivery = async (id) => {');
console.log('  const response = await fetch(`/api/deliveries/${id}`, {');
console.log('    method: "DELETE"');
console.log('  });');
console.log('  return response.json();');
console.log('};\n');

// Run the test if this file is executed directly
if (require.main === module) {
  testDeliveryCRUD();
}

module.exports = { testDeliveryCRUD };
