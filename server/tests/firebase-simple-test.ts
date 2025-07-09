import { firebase } from '../lib/firebase';

async function createSimpleTestData() {
  console.log('Creating visible test data in Firestore...');
  
  try {
    // Create a simple test document you can easily see
    const testDoc = {
      platform: 'DUXXAN',
      message: 'Firebase connection test successful',
      timestamp: new Date().toISOString(),
      testNumber: Math.floor(Math.random() * 1000),
      status: 'active',
      createdBy: 'DUXXAN_Backend'
    };
    
    await firebase.saveDocument('connection_test', 'verification_doc', testDoc);
    console.log('✅ Test document created in collection: connection_test');
    
    // Create platform statistics
    const stats = {
      totalRaffles: 8,
      totalDonations: 12,
      platformVolume: '15234.50 USDT',
      activeUsers: 127,
      lastUpdated: new Date().toISOString()
    };
    
    await firebase.saveDocument('duxxan_analytics', 'current_stats', stats);
    console.log('✅ Analytics document created in collection: duxxan_analytics');
    
    // Create a raffle event
    const raffleEvent = {
      eventType: 'raffle_winner_announced',
      raffleId: 5,
      winnerUserId: 42,
      prizeAmount: '2500.00',
      currency: 'USDT',
      timestamp: new Date().toISOString(),
      raffleTitle: 'Children Education Fund'
    };
    
    await firebase.saveDocument('raffle_activities', `event_${Date.now()}`, raffleEvent);
    console.log('✅ Raffle event created in collection: raffle_activities');
    
    // Create a donation event
    const donationEvent = {
      eventType: 'donation_received',
      donationId: 7,
      amount: '150.00',
      currency: 'USDT',
      donorId: 'anonymous',
      campaignTitle: 'Cancer Research Support',
      timestamp: new Date().toISOString()
    };
    
    await firebase.saveDocument('donation_activities', `event_${Date.now()}`, donationEvent);
    console.log('✅ Donation event created in collection: donation_activities');
    
    console.log('\n🎉 Test data successfully created!');
    console.log('\nCheck your Firebase Console > Firestore Database for these collections:');
    console.log('• connection_test > verification_doc');
    console.log('• duxxan_analytics > current_stats');
    console.log('• raffle_activities > [timestamped document]');
    console.log('• donation_activities > [timestamped document]');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to create test data:', error);
    return false;
  }
}

createSimpleTestData().then(result => {
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});