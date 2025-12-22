// Test script to create a sample order
// Run with: node scripts/test-order.js

const sampleOrder = {
  customer_name: "John Doe",
  customer_contact: "+254712345678",
  items: [
    {
      product_id: "PROD0012",
      quantity: 1
    },
    {
      product_id: "PROD0013",
      quantity: 2
    }
  ],
  payment_method: "mpesa",
  shipping_address: {
    address: "123 Test Street",
    city: "Nairobi",
    postal_code: "00100",
    country: "Kenya"
  },
  service_note: "Test order created for demonstration"
};

// Create a test order via API
async function createTestOrder() {
  try {
    console.log('Creating test order...');
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sampleOrder)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Test order created successfully!');
      console.log('Order details:', data.data);
      console.log('Order Number:', data.data.order_number);
    } else {
      console.error('❌ Failed to create test order:', data.error);
    }
  } catch (error) {
    console.error('❌ Error creating test order:', error);
  }
}

createTestOrder();