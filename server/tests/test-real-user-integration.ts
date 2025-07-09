import { redis } from '../lib/redis';
import { firebase } from '../lib/firebase';

async function testRealUserIntegration() {
  console.log('Gerçek kullanıcı verilerinin Redis ve Firebase entegrasyonu test ediliyor...');
  
  try {
    // Test user login simulation
    const userId = 1247;
    const walletAddress = '0x742d35Cc6634C0532925a3b8D6C8C6';
    
    // Simulate user session creation (as done in login route)
    const sessionKey = `duxxan:user:${userId}:session`;
    await redis.hset(sessionKey, 'userId', userId.toString());
    await redis.hset(sessionKey, 'username', 'test_user_real');
    await redis.hset(sessionKey, 'walletAddress', walletAddress);
    await redis.hset(sessionKey, 'lastLoginTime', new Date().toISOString());
    await redis.hset(sessionKey, 'deviceType', 'web');
    await redis.hset(sessionKey, 'status', 'active');
    
    console.log(`✅ User session created in Redis: ${sessionKey}`);
    
    // Verify session exists
    const sessionData = await redis.hgetall(sessionKey);
    console.log('Session data:', sessionData);
    
    // Simulate Firebase user activity logging
    await firebase.saveUserActivity(userId, 'test_login', {
      walletAddress: walletAddress,
      deviceType: 'web',
      loginTime: new Date().toISOString(),
      testData: true
    });
    
    console.log('✅ User activity logged in Firebase');
    
    // Simulate raffle creation
    const raffleId = 999;
    const raffleKey = `duxxan:raffle:${raffleId}:live_stats`;
    
    await redis.hset(raffleKey, 'raffleId', raffleId.toString());
    await redis.hset(raffleKey, 'title', 'Test Raffle - Real Integration');
    await redis.hset(raffleKey, 'prizeValue', '1000.00');
    await redis.hset(raffleKey, 'ticketPrice', '50.00');
    await redis.hset(raffleKey, 'totalTickets', '0');
    await redis.hset(raffleKey, 'status', 'active');
    await redis.hset(raffleKey, 'createdAt', new Date().toISOString());
    await redis.hset(raffleKey, 'creatorId', userId.toString());
    
    console.log(`✅ Raffle created in Redis: ${raffleKey}`);
    
    // Log raffle in Firebase
    await firebase.saveRaffleEvent(raffleId, 'test_raffle_created', {
      title: 'Test Raffle - Real Integration',
      prizeValue: '1000.00',
      creatorId: userId,
      testData: true,
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Raffle event logged in Firebase');
    
    // Check all created data
    console.log('\n📊 Verification of stored data:');
    
    // Redis verification
    const userSession = await redis.hgetall(sessionKey);
    const raffleStats = await redis.hgetall(raffleKey);
    
    console.log(`Redis - User session fields: ${Object.keys(userSession).length}`);
    console.log(`Redis - Raffle stats fields: ${Object.keys(raffleStats).length}`);
    
    // List all DUXXAN keys in Redis
    const allKeys = await redis.exists(sessionKey) ? [sessionKey] : [];
    const raffleExists = await redis.exists(raffleKey);
    if (raffleExists) allKeys.push(raffleKey);
    
    console.log('\n🔍 Redis Keys Found:');
    for (const key of allKeys) {
      const fieldCount = Object.keys(await redis.hgetall(key)).length;
      console.log(`  ${key}: ${fieldCount} fields`);
    }
    
    console.log('\n🎉 BAŞARILI: Gerçek kullanıcı verileri hem Redis hem Firebase\'de saklandı');
    console.log('\nKullanıcılar artık şu şekilde görülebilir:');
    console.log('Redis CLI: HGETALL duxxan:user:1247:session');
    console.log('Redis CLI: HGETALL duxxan:raffle:999:live_stats');
    console.log('Firebase Console: duxxan_analytics koleksiyonu');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testRealUserIntegration().then(success => {
  console.log(success ? '\n✅ Integration test completed successfully' : '\n❌ Integration test failed');
  process.exit(success ? 0 : 1);
});