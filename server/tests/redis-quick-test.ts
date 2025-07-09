import { redis } from '../lib/redis';

async function quickRedisHashTest() {
  try {
    console.log('Redis hash oluşturma ve doğrulama...');
    
    // Test connection
    await redis.ping();
    console.log('Redis bağlantısı aktif');
    
    // Create essential hashes
    const sessionKey = 'duxxan:user:1247:session';
    const raffleKey = 'duxxan:raffle:5:stats';
    const txKey = 'duxxan:tx:sample';
    
    // User session hash
    await redis.hset(sessionKey, 'userId', '1247');
    await redis.hset(sessionKey, 'username', 'crypto_trader');
    await redis.hset(sessionKey, 'walletAddress', '0x742d35Cc6634C0532925a3b8D6C8C6');
    await redis.hset(sessionKey, 'status', 'active');
    await redis.hset(sessionKey, 'loginTime', new Date().toISOString());
    
    // Raffle stats hash
    await redis.hset(raffleKey, 'raffleId', '5');
    await redis.hset(raffleKey, 'title', 'iPhone 15 Pro Max');
    await redis.hset(raffleKey, 'totalEntries', '127');
    await redis.hset(raffleKey, 'prizeValue', '2500.00');
    await redis.hset(raffleKey, 'status', 'active');
    
    // Transaction hash
    await redis.hset(txKey, 'hash', '0xa1b2c3d4e5f6789');
    await redis.hset(txKey, 'amount', '25.00');
    await redis.hset(txKey, 'currency', 'USDT');
    await redis.hset(txKey, 'status', 'confirmed');
    
    console.log('Hash\'ler oluşturuldu');
    
    // Verify hashes exist
    const sessionData = await redis.hgetall(sessionKey);
    const raffleData = await redis.hgetall(raffleKey);
    const txData = await redis.hgetall(txKey);
    
    console.log(`${sessionKey}: ${Object.keys(sessionData).length} field`);
    console.log(`${raffleKey}: ${Object.keys(raffleData).length} field`);
    console.log(`${txKey}: ${Object.keys(txData).length} field`);
    
    // Test field retrieval
    const username = await redis.hget(sessionKey, 'username');
    const raffleTitle = await redis.hget(raffleKey, 'title');
    const txAmount = await redis.hget(txKey, 'amount');
    
    console.log(`Username: ${username}`);
    console.log(`Raffle: ${raffleTitle}`);
    console.log(`Amount: ${txAmount} USDT`);
    
    console.log('SUCCESS: Redis hash\'leri oluşturuldu ve doğrulandı');
    return true;
    
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

quickRedisHashTest().then(success => {
  process.exit(success ? 0 : 1);
});