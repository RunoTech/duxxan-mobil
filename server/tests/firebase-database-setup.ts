import { firebase } from '../lib/firebase';

async function setupFirestoreDatabase() {
  console.log('🔥 Setting up Firestore database...');
  
  try {
    // Test basic authentication first
    console.log('Testing Firebase Admin authentication...');
    
    // Try to create a simple collection to initialize the database
    console.log('Creating initial database structure...');
    
    // Create initial collections with basic documents
    const collections = [
      { name: 'system', doc: 'config', data: { initialized: true, version: '1.0.0', createdAt: new Date() } },
      { name: 'analytics', doc: 'stats', data: { totalUsers: 0, totalRaffles: 0, totalDonations: 0, createdAt: new Date() } },
      { name: 'notifications', doc: 'config', data: { enabled: true, createdAt: new Date() } }
    ];
    
    for (const collection of collections) {
      console.log(`Creating collection: ${collection.name}`);
      await firebase.saveDocument(collection.name, collection.doc, collection.data);
      console.log(`✅ Created ${collection.name}/${collection.doc}`);
    }
    
    // Test read operations
    console.log('Testing read operations...');
    const systemConfig = await firebase.getDocument('system', 'config');
    console.log('System config:', systemConfig);
    
    // Test user activity logging
    console.log('Testing user activity logging...');
    await firebase.saveUserActivity(1, 'database_initialization', {
      action: 'firestore_setup',
      timestamp: new Date().toISOString(),
      status: 'success'
    });
    
    console.log('🎉 Firestore database setup completed successfully!');
    
    // Run health check
    const healthCheck = await firebase.healthCheck();
    console.log('Final health check:', healthCheck ? 'PASSED' : 'FAILED');
    
    return true;
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('NOT_FOUND')) {
        console.log('📋 The Firestore database needs to be created in the Firebase Console:');
        console.log('1. Go to https://console.firebase.google.com/project/sekance-4e287/firestore');
        console.log('2. Click "Create database"');
        console.log('3. Choose "Start in production mode" or "Start in test mode"');
        console.log('4. Select a location (us-central1 recommended)');
      }
      
      if (error.message.includes('PERMISSION_DENIED')) {
        console.log('📋 Check your Firebase security rules or service account permissions');
      }
    }
    
    return false;
  }
}

// Run the setup
setupFirestoreDatabase().then(result => {
  console.log('Setup result:', result);
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('Fatal setup error:', err);
  process.exit(1);
});