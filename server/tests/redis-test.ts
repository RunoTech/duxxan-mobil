import { redis } from '../lib/redis';
import { jobQueue } from '../lib/queue-redis';

async function testRedisIntegration() {
  console.log('🔧 Testing Redis integration...');
  
  try {
    // Test basic Redis connection
    console.log('Testing Redis ping...');
    const pingResult = await redis.ping();
    console.log('Redis ping result:', pingResult);
    
    // Test basic Redis operations
    console.log('Testing Redis set/get operations...');
    await redis.set('duxxan:test', { message: 'Redis integration test', timestamp: new Date() });
    const testData = await redis.get('duxxan:test');
    console.log('Retrieved test data:', testData);
    
    // Test Redis caching
    console.log('Testing cache operations...');
    const testRaffles = [
      { id: 1, title: 'Test Raffle 1', amount: '1000 USDT' },
      { id: 2, title: 'Test Raffle 2', amount: '2500 USDT' }
    ];
    await redis.cacheRaffles(testRaffles, 300);
    const cachedRaffles = await redis.getCachedRaffles();
    console.log('Cached raffles retrieved:', cachedRaffles?.length || 0, 'items');
    
    // Test session management
    console.log('Testing session management...');
    const sessionData = { userId: 42, username: 'test_user', loginTime: new Date() };
    await redis.setSession('test_session_123', sessionData, 3600);
    const retrievedSession = await redis.getSession('test_session_123');
    console.log('Session data retrieved:', retrievedSession);
    
    // Test rate limiting
    console.log('Testing rate limiting...');
    const rateLimitResult = await redis.checkRateLimit('test_user_ip', 10, 60);
    console.log('Rate limit check:', rateLimitResult);
    
    // Test job queue
    console.log('Testing Redis job queue...');
    
    // Add test jobs
    await jobQueue.addJob('email_notification', {
      to: 'winner@example.com',
      subject: 'Congratulations! You won the raffle!',
      template: 'raffle_winner',
      data: { prizeName: 'Children Education Fund', amount: '2500 USDT' }
    }, { priority: 1 });
    
    await jobQueue.addJob('blockchain_transaction', {
      transactionHash: '0x1234567890abcdef',
      type: 'raffle_payout',
      userId: 42,
      amount: '2500.00'
    }, { priority: 2 });
    
    await jobQueue.addJob('push_notification', {
      userIds: [42, 43, 44],
      title: 'Raffle Winner Announced!',
      body: 'Check if you won the latest raffle draw!',
      type: 'raffle_result'
    }, { priority: 1 });
    
    console.log('Jobs added to queue successfully');
    
    // Get queue stats
    const queueStats = await jobQueue.getStats();
    console.log('Queue statistics:', queueStats);
    
    // Test WebSocket connection tracking
    console.log('Testing WebSocket connection tracking...');
    await redis.addConnection(42, 'socket_123');
    await redis.addConnection(43, 'socket_456');
    const userConnections = await redis.getUserConnections(42);
    console.log('User 42 connections:', userConnections);
    
    // Test transaction tracking
    console.log('Testing blockchain transaction tracking...');
    await redis.trackTransaction('0xtest123', {
      type: 'raffle_entry',
      userId: 42,
      amount: '50.00',
      status: 'pending'
    });
    const trackedTx = await redis.getTransaction('0xtest123');
    console.log('Tracked transaction:', trackedTx);
    
    console.log('\n🎉 Redis integration test completed successfully!');
    console.log('Redis is now active for:');
    console.log('• Caching raffle and donation data');
    console.log('• Managing user sessions');
    console.log('• Rate limiting API requests');
    console.log('• Queue processing for emails and notifications');
    console.log('• WebSocket connection management');
    console.log('• Blockchain transaction tracking');
    
    return true;
    
  } catch (error) {
    console.error('❌ Redis integration test failed:', error);
    return false;
  }
}

testRedisIntegration().then(result => {
  process.exit(result ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});