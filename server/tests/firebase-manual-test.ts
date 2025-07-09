import { firebase } from '../lib/firebase';

async function testFirebaseManually() {
  console.log('🔥 Starting Firebase manual test...');
  
  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const healthCheck = await firebase.healthCheck();
    console.log('Health check result:', healthCheck);
    
    // Test 2: Save a test document
    console.log('Test 2: Save test document');
    const testData = {
      message: 'Firebase test from DUXXAN',
      timestamp: new Date().toISOString(),
      platform: 'development'
    };
    
    await firebase.saveDocument('test', 'duxxan-test', testData);
    console.log('✅ Document saved successfully');
    
    // Test 3: Retrieve the document
    console.log('Test 3: Retrieve test document');
    const retrieved = await firebase.getDocument('test', 'duxxan-test');
    console.log('Retrieved document:', retrieved);
    
    // Test 4: Test user activity logging
    console.log('Test 4: User activity logging');
    await firebase.saveUserActivity(1, 'firebase_test', { 
      testId: 'manual-test',
      status: 'success' 
    });
    console.log('✅ User activity logged');
    
    console.log('🎉 All Firebase tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    
    // Check if it's the known Firestore API disabled error
    if (error instanceof Error && error.message.includes('Cloud Firestore API has not been used')) {
      console.log('📋 Action needed: Enable Firestore API at:');
      console.log('https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=sekance-4e287');
      return false;
    }
    
    throw error;
  }
}

// Run the test immediately
testFirebaseManually().then(result => {
  console.log('Final result:', result);
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});