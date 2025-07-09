import { firebase } from '../lib/firebase';

async function createTestData() {
  console.log('🔥 Creating test data in Firestore...');
  
  try {
    // Create platform analytics
    const platformStats = {
      totalUsers: 127,
      totalRaffles: 23,
      totalDonations: 45,
      totalVolume: '$15,234.50',
      lastUpdated: new Date(),
      status: 'active'
    };
    
    await firebase.saveDocument('analytics', 'platform_stats', platformStats);
    console.log('✅ Platform statistics saved');
    
    // Create raffle events
    const raffleEvents = [
      {
        raffleId: 5,
        eventType: 'raffle_created',
        title: 'Help Children in Need',
        prizeAmount: '2500 USDT',
        creator: 'UNICEF Turkey',
        timestamp: new Date(),
        participants: 89
      },
      {
        raffleId: 6,
        eventType: 'ticket_purchased',
        raffleTitle: 'Education Fund Raffle',
        buyer: 'user_42',
        ticketCount: 5,
        amount: '50 USDT',
        timestamp: new Date()
      }
    ];
    
    for (let i = 0; i < raffleEvents.length; i++) {
      await firebase.saveDocument('raffle_events', `event_${Date.now()}_${i}`, raffleEvents[i]);
      console.log(`✅ Raffle event ${i + 1} saved`);
    }
    
    // Create donation activities
    const donationEvents = [
      {
        donationId: 5,
        eventType: 'donation_received',
        title: 'Cancer Research Fund',
        amount: '125 USDT',
        donor: 'anonymous_user',
        currentTotal: '3450 USDT',
        goalAmount: '10000 USDT',
        timestamp: new Date()
      },
      {
        donationId: 7,
        eventType: 'goal_reached',
        title: 'Emergency Relief Fund',
        finalAmount: '5000 USDT',
        totalDonors: 234,
        completedAt: new Date()
      }
    ];
    
    for (let i = 0; i < donationEvents.length; i++) {
      await firebase.saveDocument('donation_events', `event_${Date.now()}_${i}`, donationEvents[i]);
      console.log(`✅ Donation event ${i + 1} saved`);
    }
    
    // Create user activities
    const userActivities = [
      {
        userId: 1,
        activity: 'raffle_participation',
        details: 'Purchased 3 tickets for Children Education Raffle',
        amount: '30 USDT',
        timestamp: new Date()
      },
      {
        userId: 2,
        activity: 'donation_made',
        details: 'Donated to Cancer Research Fund',
        amount: '250 USDT',
        timestamp: new Date()
      },
      {
        userId: 3,
        activity: 'raffle_created',
        details: 'Created new raffle for Animal Shelter',
        prizeAmount: '1500 USDT',
        timestamp: new Date()
      }
    ];
    
    for (let i = 0; i < userActivities.length; i++) {
      await firebase.saveUserActivity(
        userActivities[i].userId,
        userActivities[i].activity,
        {
          details: userActivities[i].details,
          amount: userActivities[i].amount,
          timestamp: userActivities[i].timestamp
        }
      );
      console.log(`✅ User activity ${i + 1} saved`);
    }
    
    // Create notification logs
    const notificationLogs = [
      {
        type: 'raffle_winner',
        title: 'Congratulations! You won!',
        message: 'You are the winner of the Education Fund Raffle - 2500 USDT!',
        userId: 42,
        status: 'sent',
        timestamp: new Date()
      },
      {
        type: 'donation_milestone',
        title: 'Milestone Reached!',
        message: 'Cancer Research Fund reached 50% of its goal thanks to your support!',
        broadcastTo: 'all_donors',
        status: 'scheduled',
        timestamp: new Date()
      }
    ];
    
    for (let i = 0; i < notificationLogs.length; i++) {
      await firebase.saveDocument('notifications', `notification_${Date.now()}_${i}`, notificationLogs[i]);
      console.log(`✅ Notification ${i + 1} saved`);
    }
    
    // Create system logs
    const systemLog = {
      event: 'firebase_integration_test',
      status: 'success',
      platform: 'DUXXAN',
      version: '1.0.0',
      timestamp: new Date(),
      details: 'Firebase integration fully operational with Firestore database'
    };
    
    await firebase.saveDocument('system_logs', `log_${Date.now()}`, systemLog);
    console.log('✅ System log saved');
    
    console.log('\n🎉 All test data created successfully!');
    console.log('Check your Firebase Console > Firestore Database to see:');
    console.log('- analytics/platform_stats');
    console.log('- raffle_events/* (multiple documents)');
    console.log('- donation_events/* (multiple documents)');
    console.log('- user_activities/* (multiple documents)');
    console.log('- notifications/* (multiple documents)');
    console.log('- system_logs/* (multiple documents)');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to create test data:', error);
    return false;
  }
}

// Run the test
createTestData().then(result => {
  console.log('Test data creation result:', result);
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});