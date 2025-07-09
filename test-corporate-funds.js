// Test Corporate Funds API endpoints
const API_BASE = 'http://localhost:5000';

async function testCorporateFundsAPI() {
  console.log('Testing Corporate Funds API...');
  
  try {
    // Test GET /api/corporate-funds
    console.log('1. Testing GET /api/corporate-funds');
    const response = await fetch(`${API_BASE}/api/corporate-funds`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    // Test statistics endpoint
    console.log('\n2. Testing GET /api/corporate-funds/statistics');
    const statsResponse = await fetch(`${API_BASE}/api/corporate-funds/statistics`);
    const statsData = await statsResponse.json();
    console.log('Status:', statsResponse.status);
    console.log('Statistics:', statsData);
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
}

// Run test
testCorporateFundsAPI();