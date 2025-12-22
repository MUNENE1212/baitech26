import fetch from 'node-fetch';

// Test configuration
const BASE_URL = 'http://localhost:3000';
let authToken = '';

async function testLogin() {
  console.log('🔐 Testing admin login...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@baitech.co.ke',
        password: 'admin123'
      })
    });

    const data = await response.json();

    if (response.ok && data.data && data.data.access_token) {
      authToken = data.data.access_token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testCreateProduct() {
  console.log('📦 Testing product creation...');
  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        product_id: 'test-product-001',
        name: 'Test Product for API Debug',
        description: 'This is a test product created to verify API functionality',
        price: 2999.99,
        stock: 50,
        category: 'Electronics',
        subcategory: 'Accessories',
        features: ['Wireless', 'Bluetooth 5.0', 'Water Resistant'],
        images: [],
        featured: false
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Product creation successful');
      console.log('Product ID:', data.data.id);
      return data.data.id;
    } else {
      console.log('❌ Product creation failed:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Product creation error:', error.message);
    return null;
  }
}

async function testUpdateProduct(productId) {
  if (!productId) {
    console.log('❌ Cannot test update - no product ID');
    return false;
  }

  console.log('📝 Testing product update...');
  try {
    const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Updated Test Product',
        price: 2499.99,
        stock: 45,
        featured: true
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Product update successful');
      return true;
    } else {
      console.log('❌ Product update failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Product update error:', error.message);
    return false;
  }
}

async function testImageUpload() {
  console.log('🖼️  Testing image upload...');
  try {
    // Create a simple test image buffer (1x1 PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('files', blob, 'test-image.png');

    const response = await fetch(`${BASE_URL}/api/admin/upload-images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Image upload successful');
      console.log('Uploaded files:', data.data.length);
      return true;
    } else {
      console.log('❌ Image upload failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Image upload error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Test 2: Create Product
  const productId = await testCreateProduct();

  // Test 3: Update Product
  await testUpdateProduct(productId);

  // Test 4: Image Upload
  await testImageUpload();

  console.log('\n🏁 API Tests Completed!');
}

// Run the tests
runTests().catch(console.error);