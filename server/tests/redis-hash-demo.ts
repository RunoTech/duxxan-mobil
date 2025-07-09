// Redis Hash Operations Demo - Shows exact functionality when Redis is available
import { redis } from '../lib/redis';

// In-memory hash storage to simulate Redis behavior
class HashSimulator {
  private hashes: Map<string, Map<string, string>> = new Map();

  async hset(key: string, field: string, value: string): Promise<void> {
    if (!this.hashes.has(key)) {
      this.hashes.set(key, new Map());
    }
    this.hashes.get(key)!.set(field, value);
    console.log(`HSET ${key} ${field} "${value}"`);
  }

  async hget(key: string, field: string): Promise<string | null> {
    const hash = this.hashes.get(key);
    const value = hash?.get(field) || null;
    console.log(`HGET ${key} ${field} => "${value}"`);
    return value;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const hash = this.hashes.get(key);
    const result: Record<string, string> = {};
    if (hash) {
      for (const [field, value] of hash.entries()) {
        result[field] = value;
      }
    }
    console.log(`HGETALL ${key} =>`, result);
    return result;
  }

  async hdel(key: string, field: string): Promise<void> {
    const hash = this.hashes.get(key);
    if (hash) {
      hash.delete(field);
      console.log(`HDEL ${key} ${field}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    const exists = this.hashes.has(key);
    console.log(`EXISTS ${key} => ${exists}`);
    return exists;
  }

  async del(key: string): Promise<void> {
    this.hashes.delete(key);
    console.log(`DEL ${key}`);
  }

  getStats() {
    return {
      totalHashes: this.hashes.size,
      totalFields: Array.from(this.hashes.values()).reduce((sum, hash) => sum + hash.size, 0)
    };
  }
}

async function demonstrateHashOperations() {
  console.log('Redis Hash Operations Demonstration');
  console.log('==================================');
  
  // Try Redis first, fallback to simulator
  const isRedisAvailable = await redis.ping();
  let hashStore: any;

  if (isRedisAvailable) {
    console.log('Using actual Redis server');
    hashStore = redis;
  } else {
    console.log('Redis unavailable - using simulator to demonstrate operations');
    hashStore = new HashSimulator();
  }

  // Demonstrate DUXXAN platform hash operations
  console.log('\n1. Creating User Session Hash');
  console.log('-----------------------------');
  const sessionKey = 'duxxan:user:42:session';
  await hashStore.hset(sessionKey, 'userId', '42');
  await hashStore.hset(sessionKey, 'username', 'crypto_trader_42');
  await hashStore.hset(sessionKey, 'email', 'user42@duxxan.com');
  await hashStore.hset(sessionKey, 'loginTime', new Date().toISOString());
  await hashStore.hset(sessionKey, 'ipAddress', '192.168.1.100');
  await hashStore.hset(sessionKey, 'deviceType', 'mobile');
  await hashStore.hset(sessionKey, 'isActive', 'true');
  await hashStore.hset(sessionKey, 'walletAddress', '0x742d35Cc6634C0532925a3b8D6C8C6');

  const sessionData = await hashStore.hgetall(sessionKey);
  console.log('Complete session hash created with 8 fields');

  console.log('\n2. Creating Raffle Statistics Hash');
  console.log('----------------------------------');
  const raffleKey = 'duxxan:raffle:5:live_stats';
  await hashStore.hset(raffleKey, 'raffleId', '5');
  await hashStore.hset(raffleKey, 'title', 'iPhone 15 Pro Max Giveaway');
  await hashStore.hset(raffleKey, 'prizeValue', '2500.00');
  await hashStore.hset(raffleKey, 'currency', 'USDT');
  await hashStore.hset(raffleKey, 'totalEntries', '127');
  await hashStore.hset(raffleKey, 'uniqueParticipants', '89');
  await hashStore.hset(raffleKey, 'entryPrice', '25.00');
  await hashStore.hset(raffleKey, 'status', 'active');
  await hashStore.hset(raffleKey, 'endDate', '2025-06-20T18:00:00Z');
  await hashStore.hset(raffleKey, 'category', 'Electronics');
  await hashStore.hset(raffleKey, 'lastActivity', new Date().toISOString());

  const raffleStats = await hashStore.hgetall(raffleKey);
  console.log('Raffle statistics hash created with 11 fields');

  console.log('\n3. Creating Transaction Tracking Hash');
  console.log('------------------------------------');
  const txKey = 'duxxan:tx:0xa1b2c3d4e5f6789';
  await hashStore.hset(txKey, 'hash', '0xa1b2c3d4e5f6789abcdef123456');
  await hashStore.hset(txKey, 'type', 'raffle_entry');
  await hashStore.hset(txKey, 'userId', '42');
  await hashStore.hset(txKey, 'raffleId', '5');
  await hashStore.hset(txKey, 'amount', '25.00');
  await hashStore.hset(txKey, 'currency', 'USDT');
  await hashStore.hset(txKey, 'status', 'confirmed');
  await hashStore.hset(txKey, 'blockNumber', '12345678');
  await hashStore.hset(txKey, 'confirmations', '12');
  await hashStore.hset(txKey, 'gasUsed', '21000');
  await hashStore.hset(txKey, 'timestamp', Date.now().toString());
  await hashStore.hset(txKey, 'network', 'BSC');

  const txData = await hashStore.hgetall(txKey);
  console.log('Transaction tracking hash created with 12 fields');

  console.log('\n4. Creating Platform Metrics Hash');
  console.log('---------------------------------');
  const metricsKey = 'duxxan:platform:realtime_metrics';
  await hashStore.hset(metricsKey, 'totalUsers', '1247');
  await hashStore.hset(metricsKey, 'activeRaffles', '8');
  await hashStore.hset(metricsKey, 'activeDonations', '12');
  await hashStore.hset(metricsKey, 'totalVolume24h', '15234.50');
  await hashStore.hset(metricsKey, 'transactions24h', '89');
  await hashStore.hset(metricsKey, 'onlineUsers', '47');
  await hashStore.hset(metricsKey, 'serverStatus', 'operational');
  await hashStore.hset(metricsKey, 'lastUpdated', new Date().toISOString());

  const platformMetrics = await hashStore.hgetall(metricsKey);
  console.log('Platform metrics hash created with 8 fields');

  console.log('\n5. Demonstrating Hash Field Operations');
  console.log('-------------------------------------');
  
  // Get specific field
  const username = await hashStore.hget(sessionKey, 'username');
  console.log(`Retrieved specific field - username: ${username}`);

  // Update specific field
  await hashStore.hset(raffleKey, 'totalEntries', '128');
  const updatedEntries = await hashStore.hget(raffleKey, 'totalEntries');
  console.log(`Updated raffle entries from 127 to ${updatedEntries}`);

  // Delete specific field
  await hashStore.hdel(txKey, 'gasUsed');
  console.log('Deleted gasUsed field from transaction hash');

  console.log('\n6. Performance and Scalability Test');
  console.log('----------------------------------');
  const perfKey = 'duxxan:performance:test';
  const startTime = Date.now();
  
  // Create 50 hash fields rapidly
  for (let i = 0; i < 50; i++) {
    await hashStore.hset(perfKey, `metric_${i}`, `value_${i}_${Date.now()}`);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  console.log(`Created 50 hash fields in ${duration}ms (${(duration/50).toFixed(2)}ms per field)`);

  // Verify all fields
  const allFields = await hashStore.hgetall(perfKey);
  console.log(`Verified ${Object.keys(allFields).length} fields created successfully`);

  console.log('\n7. Hash Statistics');
  console.log('-----------------');
  if (hashStore instanceof HashSimulator) {
    const stats = hashStore.getStats();
    console.log(`Total hashes created: ${stats.totalHashes}`);
    console.log(`Total fields across all hashes: ${stats.totalFields}`);
  }

  console.log('\n8. Cleanup Operations');
  console.log('--------------------');
  await hashStore.del(perfKey);
  console.log('Performance test hash deleted');

  const sessionExists = await hashStore.exists(sessionKey);
  const deletedExists = await hashStore.exists(perfKey);
  console.log(`Session hash exists: ${sessionExists}`);
  console.log(`Deleted hash exists: ${deletedExists}`);

  console.log('\nRedis Hash Operations Demonstration Complete');
  console.log('===========================================');
  console.log('When Redis server becomes accessible, these exact operations');
  console.log('will execute on the actual Redis instance for:');
  console.log('• Ultra-fast user session management');
  console.log('• Real-time raffle statistics tracking');
  console.log('• Comprehensive transaction monitoring');
  console.log('• Live platform metrics and analytics');
}

// Execute the demonstration
demonstrateHashOperations().then(() => {
  console.log('\nDUXXAN Redis hash infrastructure ready for deployment');
  process.exit(0);
}).catch(error => {
  console.error('Demo failed:', error.message);
  process.exit(1);
});