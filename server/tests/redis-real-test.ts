import { redis } from '../lib/redis';

async function testRealRedisConnection() {
  console.log('Testing actual Redis connection and hash creation...');
  
  try {
    // Test basic connection
    console.log('1. Testing Redis ping...');
    const pingResult = await redis.ping();
    console.log('Redis ping result:', pingResult);
    
    if (!pingResult) {
      console.log('Redis server not accessible. Checking configuration...');
      console.log('REDIS_URL:', process.env.REDIS_URL);
      return false;
    }
    
    console.log('2. Creating actual Redis hashes...');
    
    // Create user session hash
    const sessionKey = 'duxxan:user:42:session';
    await redis.hset(sessionKey, 'userId', '42');
    await redis.hset(sessionKey, 'username', 'test_user');
    await redis.hset(sessionKey, 'loginTime', new Date().toISOString());
    await redis.hset(sessionKey, 'status', 'active');
    
    // Verify hash was created
    const sessionData = await redis.hgetall(sessionKey);
    console.log('User session hash created:', sessionData);
    
    // Create raffle stats hash
    const raffleKey = 'duxxan:raffle:1:stats';
    await redis.hset(raffleKey, 'raffleId', '1');
    await redis.hset(raffleKey, 'title', 'Test Raffle');
    await redis.hset(raffleKey, 'totalEntries', '10');
    await redis.hset(raffleKey, 'prizeAmount', '100.00');
    
    // Verify raffle hash
    const raffleData = await redis.hgetall(raffleKey);
    console.log('Raffle stats hash created:', raffleData);
    
    // Test hash operations
    const entryCount = await redis.hget(raffleKey, 'totalEntries');
    console.log('Retrieved entry count:', entryCount);
    
    // Update a field
    await redis.hset(raffleKey, 'totalEntries', '11');
    const updatedCount = await redis.hget(raffleKey, 'totalEntries');
    console.log('Updated entry count:', updatedCount);
    
    console.log('Redis hash operations completed successfully!');
    return true;
    
  } catch (error) {
    console.error('Redis test failed:', error.message);
    return false;
  }
}

testRealRedisConnection().then(success => {
  if (success) {
    console.log('✅ Redis hashes created successfully in database');
  } else {
    console.log('❌ Redis connection failed - hashes not created');
  }
  process.exit(success ? 0 : 1);
});