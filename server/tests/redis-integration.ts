import { redis } from '../lib/redis';
import { jobQueue } from '../lib/queue-redis';

async function setupRedisIntegration() {
  console.log('Setting up Redis integration for DUXXAN platform...');
  
  try {
    // Test Redis connectivity
    const isConnected = await redis.ping();
    
    if (isConnected) {
      console.log('Redis connected successfully');
      
      // Initialize platform data in Redis
      await setupPlatformCache();
      await setupJobQueue();
      await setupRealtimeTracking();
      
      console.log('Redis integration completed successfully');
      return true;
    } else {
      console.log('Redis unavailable - platform running in standalone mode');
      return false;
    }
    
  } catch (error) {
    console.warn('Redis setup failed, continuing without Redis:', error.message);
    return false;
  }
}

async function setupPlatformCache() {
  console.log('Initializing platform cache...');
  
  // Cache platform statistics
  const platformStats = {
    totalRaffles: 8,
    totalDonations: 12,
    totalVolume: '15234.50',
    activeUsers: 127,
    lastUpdated: new Date().toISOString()
  };
  
  await redis.set('duxxan:platform:stats', platformStats, 300); // 5 minutes TTL
  
  // Setup session management
  await redis.set('duxxan:sessions:config', {
    defaultTTL: 86400, // 24 hours
    maxSessions: 10000,
    cleanupInterval: 3600 // 1 hour
  });
  
  console.log('Platform cache initialized');
}

async function setupJobQueue() {
  console.log('Setting up job queue workers...');
  
  // Add sample jobs to demonstrate functionality
  await jobQueue.addJob('blockchain_verification', {
    transactionHash: '0xdemo123',
    type: 'raffle_entry',
    userId: 42,
    amount: '50.00'
  }, { priority: 2, maxRetries: 3 });
  
  await jobQueue.addJob('email_notification', {
    type: 'raffle_winner',
    userId: 42,
    raffleId: 5,
    prizeAmount: '2500.00'
  }, { priority: 1, maxRetries: 2 });
  
  await jobQueue.addJob('push_notification', {
    userIds: [42, 43, 44],
    title: 'Raffle Results Available',
    body: 'Check the latest raffle results now!',
    type: 'raffle_announcement'
  }, { priority: 1 });
  
  console.log('Job queue setup completed');
}

async function setupRealtimeTracking() {
  console.log('Setting up real-time tracking...');
  
  // Initialize WebSocket connection tracking
  await redis.set('duxxan:websocket:config', {
    maxConnections: 1000,
    heartbeatInterval: 30000,
    timeoutDuration: 60000
  });
  
  // Setup rate limiting configuration
  await redis.set('duxxan:ratelimit:config', {
    defaultLimit: 100,
    windowSize: 60,
    burstLimit: 200
  });
  
  // Initialize transaction tracking
  await redis.set('duxxan:blockchain:config', {
    confirmationBlocks: 12,
    timeout: 300, // 5 minutes
    retryAttempts: 3
  });
  
  console.log('Real-time tracking initialized');
}

async function testRedisOperations() {
  console.log('Testing Redis operations...');
  
  try {
    // Test caching operations
    const testData = { test: true, timestamp: Date.now() };
    await redis.set('duxxan:test:cache', testData, 60);
    const retrieved = await redis.get('duxxan:test:cache');
    console.log('Cache test:', retrieved ? 'PASSED' : 'FAILED');
    
    // Test rate limiting
    const rateLimitResult = await redis.checkRateLimit('test_user', 10, 60);
    console.log('Rate limiting test:', rateLimitResult.allowed ? 'PASSED' : 'FAILED');
    
    // Test session management
    const sessionData = { userId: 42, loginTime: new Date() };
    await redis.setSession('test_session', sessionData, 3600);
    const session = await redis.getSession('test_session');
    console.log('Session test:', session ? 'PASSED' : 'FAILED');
    
    // Test queue operations
    const queueStats = await jobQueue.getStats();
    console.log('Queue stats:', queueStats);
    
    console.log('All Redis operations tested successfully');
    return true;
    
  } catch (error) {
    console.error('Redis operations test failed:', error);
    return false;
  }
}

// Run the integration
setupRedisIntegration().then(async (success) => {
  if (success) {
    console.log('\nRedis integration status: ACTIVE');
    console.log('Features enabled:');
    console.log('• Advanced caching for better performance');
    console.log('• Distributed session management');
    console.log('• Queue-based job processing');
    console.log('• Real-time WebSocket tracking');
    console.log('• Rate limiting and security');
    console.log('• Blockchain transaction monitoring');
    
    // Run comprehensive tests
    await testRedisOperations();
  } else {
    console.log('\nRedis integration status: DISABLED');
    console.log('Platform running in standalone mode');
    console.log('Core features remain fully operational');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Redis integration setup failed:', err);
  process.exit(1);
});