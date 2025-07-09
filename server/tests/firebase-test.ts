import { firebase } from '../lib/firebase';

export async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test basic health check
    const isHealthy = await firebase.healthCheck();
    console.log('Firebase health check:', isHealthy ? 'PASSED' : 'FAILED');
    
    if (isHealthy) {
      // Test Firestore write
      await firebase.saveDocument('test_collection', 'test_doc', {
        message: 'DUXXAN Firebase integration test',
        timestamp: new Date().toISOString(),
        platform: 'DUXXAN'
      });
      console.log('Firestore write test: PASSED');
      
      // Test Firestore read
      const testDoc = await firebase.getDocument('test_collection', 'test_doc');
      console.log('Firestore read test:', testDoc ? 'PASSED' : 'FAILED');
      
      // Log successful connection
      await firebase.saveDocument('system_logs', `connection_${Date.now()}`, {
        type: 'firebase_connection',
        status: 'success',
        connectedAt: new Date().toISOString(),
        features: ['firestore', 'auth', 'messaging']
      });
      
      console.log('Firebase fully integrated with DUXXAN platform');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
}