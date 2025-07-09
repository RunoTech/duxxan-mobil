import { RedisMemoryServer } from 'redis-memory-server';
import Redis from 'ioredis';

async function createActualRedisHashes() {
  console.log('Starting Redis Memory Server for hash testing...');
  
  // Start in-memory Redis server
  const redisServer = new RedisMemoryServer({
    instance: {
      port: 6381,
    },
  });
  
  const host = await redisServer.getHost();
  const port = await redisServer.getPort();
  
  console.log(`Redis server running at ${host}:${port}`);
  
  // Create Redis client
  const redis = new Redis({
    host,
    port,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  });
  
  try {
    // Test connection
    const pong = await redis.ping();
    console.log(`Redis connection test: ${pong}`);
    
    console.log('\nCreating DUXXAN platform hashes...');
    
    // 1. User Session Hash
    console.log('\n1. Creating user session hash:');
    const sessionKey = 'duxxan:user:1247:session';
    await redis.hset(sessionKey, {
      userId: '1247',
      username: 'crypto_trader_pro',
      email: 'trader@duxxan.com',
      walletAddress: '0x742d35Cc6634C0532925a3b8D6C8C6',
      totalRaffleEntries: '23',
      totalDonations: '5',
      memberSince: '2024-01-15',
      lastLoginTime: new Date().toISOString(),
      deviceType: 'mobile',
      ipAddress: '192.168.1.100',
      status: 'active',
      preferredLanguage: 'en'
    });
    
    const sessionData = await redis.hgetall(sessionKey);
    console.log(`Session hash created with ${Object.keys(sessionData).length} fields`);
    console.log('Sample fields:', {
      username: sessionData.username,
      walletAddress: sessionData.walletAddress,
      status: sessionData.status
    });
    
    // 2. Raffle Statistics Hash
    console.log('\n2. Creating raffle statistics hash:');
    const raffleKey = 'duxxan:raffle:5:live_stats';
    await redis.hset(raffleKey, {
      raffleId: '5',
      title: 'iPhone 15 Pro Max 256GB',
      description: 'Latest iPhone with premium features',
      prizeValue: '2500.00',
      currency: 'USDT',
      entryPrice: '25.00',
      totalEntries: '127',
      uniqueParticipants: '89',
      maxEntries: '200',
      currentRevenue: '3175.00',
      category: 'Electronics',
      status: 'active',
      startDate: '2025-06-10T10:00:00Z',
      endDate: '2025-06-20T18:00:00Z',
      lastEntryTime: new Date().toISOString()
    });
    
    const raffleData = await redis.hgetall(raffleKey);
    console.log(`Raffle hash created with ${Object.keys(raffleData).length} fields`);
    console.log('Sample fields:', {
      title: raffleData.title,
      totalEntries: raffleData.totalEntries,
      prizeValue: raffleData.prizeValue
    });
    
    // 3. Transaction Hash
    console.log('\n3. Creating blockchain transaction hash:');
    const txKey = 'duxxan:tx:0xa1b2c3d4e5f6789';
    await redis.hset(txKey, {
      transactionHash: '0xa1b2c3d4e5f6789abcdef123456789',
      blockHash: '0x9876543210fedcba9876543210fedcba',
      blockNumber: '12845673',
      type: 'raffle_entry',
      userId: '1247',
      raffleId: '5',
      amount: '25.00',
      currency: 'USDT',
      network: 'BSC',
      fromAddress: '0x742d35Cc6634C0532925a3b8D6C8C6',
      toAddress: '0xDUXXAN_PLATFORM_WALLET_ADDRESS',
      gasUsed: '21000',
      gasPrice: '5000000000',
      status: 'confirmed',
      confirmations: '15',
      timestamp: Date.now().toString()
    });
    
    const txData = await redis.hgetall(txKey);
    console.log(`Transaction hash created with ${Object.keys(txData).length} fields`);
    console.log('Sample fields:', {
      transactionHash: txData.transactionHash,
      amount: txData.amount,
      status: txData.status
    });
    
    // 4. Platform Metrics Hash
    console.log('\n4. Creating platform metrics hash:');
    const metricsKey = 'duxxan:platform:live_metrics';
    await redis.hset(metricsKey, {
      totalUsers: '1247',
      activeUsers: '156',
      onlineUsers: '47',
      totalRaffles: '8',
      activeRaffles: '6',
      totalDonations: '12',
      activeDonations: '8',
      totalVolume: '127450.75',
      volume24h: '15234.50',
      transactions24h: '89',
      newUsers24h: '23',
      totalPrizePool: '7120.00',
      serverStatus: 'operational',
      lastUpdated: new Date().toISOString()
    });
    
    const metricsData = await redis.hgetall(metricsKey);
    console.log(`Platform metrics hash created with ${Object.keys(metricsData).length} fields`);
    console.log('Sample fields:', {
      totalUsers: metricsData.totalUsers,
      totalVolume: metricsData.totalVolume,
      serverStatus: metricsData.serverStatus
    });
    
    // Test hash operations
    console.log('\n5. Testing hash operations:');
    
    // Get specific field
    const username = await redis.hget(sessionKey, 'username');
    console.log(`Retrieved username: ${username}`);
    
    // Update field
    await redis.hset(raffleKey, 'totalEntries', '128');
    const updatedEntries = await redis.hget(raffleKey, 'totalEntries');
    console.log(`Updated entries from 127 to ${updatedEntries}`);
    
    // Check field existence
    const hasEmail = await redis.hexists(sessionKey, 'email');
    console.log(`Email field exists: ${hasEmail}`);
    
    // Get hash length
    const sessionFieldCount = await redis.hlen(sessionKey);
    console.log(`Session hash has ${sessionFieldCount} fields`);
    
    // List all hash keys
    console.log('\n6. All created hashes:');
    const allKeys = await redis.keys('duxxan:*');
    for (const key of allKeys) {
      const fieldCount = await redis.hlen(key);
      console.log(`${key}: ${fieldCount} fields`);
    }
    
    console.log('\nHash verification complete - all hashes exist in Redis database');
    
    // Performance test
    console.log('\n7. Performance test:');
    const perfKey = 'duxxan:performance:test';
    const startTime = Date.now();
    
    const perfData: Record<string, string> = {};
    for (let i = 0; i < 50; i++) {
      perfData[`metric_${i}`] = `value_${i}_${Date.now()}`;
    }
    
    await redis.hset(perfKey, perfData);
    const endTime = Date.now();
    
    const perfFieldCount = await redis.hlen(perfKey);
    console.log(`Created ${perfFieldCount} fields in ${endTime - startTime}ms`);
    
    // Cleanup
    await redis.del(perfKey);
    console.log('Performance test data cleaned up');
    
    console.log('\nSUCCESS: All Redis hashes created and verified in actual database');
    
  } catch (error) {
    console.error('Redis hash test failed:', error);
  } finally {
    await redis.disconnect();
    await redisServer.stop();
    console.log('Redis server stopped');
  }
}

createActualRedisHashes();