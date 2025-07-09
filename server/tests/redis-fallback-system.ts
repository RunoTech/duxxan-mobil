import { redis } from '../lib/redis';

// Redis fallback sistemi - Redis kullanılamadığında da platform çalışır
class RedisFallbackManager {
  private memoryCache: Map<string, Map<string, string>> = new Map();
  private isRedisAvailable: boolean = false;

  async checkRedisConnection(): Promise<boolean> {
    try {
      this.isRedisAvailable = await redis.ping();
      if (this.isRedisAvailable) {
        console.log('Redis bağlantısı aktif - hash\'ler Redis\'te saklanacak');
        await this.migrateToRedis();
      } else {
        console.log('Redis kullanılamıyor - bellek tabanlı sistem aktif');
      }
      return this.isRedisAvailable;
    } catch (error) {
      this.isRedisAvailable = false;
      console.log('Redis bağlantısı yok - platform standalone modda çalışıyor');
      return false;
    }
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    if (this.isRedisAvailable) {
      try {
        await redis.hset(key, field, value);
        return;
      } catch (error) {
        console.warn('Redis yazma hatası, bellekte saklanıyor:', error.message);
        this.isRedisAvailable = false;
      }
    }
    
    // Bellek tabanlı fallback
    if (!this.memoryCache.has(key)) {
      this.memoryCache.set(key, new Map());
    }
    this.memoryCache.get(key)!.set(field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (this.isRedisAvailable) {
      try {
        return await redis.hget(key, field);
      } catch (error) {
        console.warn('Redis okuma hatası, bellekten okunuyor:', error.message);
        this.isRedisAvailable = false;
      }
    }
    
    const hash = this.memoryCache.get(key);
    return hash?.get(field) || null;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (this.isRedisAvailable) {
      try {
        return await redis.hgetall(key);
      } catch (error) {
        console.warn('Redis hgetall hatası, bellekten okunuyor:', error.message);
        this.isRedisAvailable = false;
      }
    }
    
    const hash = this.memoryCache.get(key);
    const result: Record<string, string> = {};
    if (hash) {
      hash.forEach((value, field) => {
        result[field] = value;
      });
    }
    return result;
  }

  async migrateToRedis(): Promise<void> {
    if (!this.isRedisAvailable || this.memoryCache.size === 0) return;
    
    console.log('Bellek verisi Redis\'e taşınıyor...');
    let migratedCount = 0;
    
    for (const [key, hash] of this.memoryCache.entries()) {
      try {
        for (const [field, value] of hash.entries()) {
          await redis.hset(key, field, value);
          migratedCount++;
        }
      } catch (error) {
        console.warn(`${key} hash\'i taşınırken hata:`, error.message);
      }
    }
    
    console.log(`${migratedCount} alan Redis\'e başarıyla taşındı`);
    this.memoryCache.clear();
  }

  getStatus() {
    return {
      redisAvailable: this.isRedisAvailable,
      memoryHashes: this.memoryCache.size,
      totalFields: Array.from(this.memoryCache.values()).reduce((sum, hash) => sum + hash.size, 0)
    };
  }
}

// Global fallback manager
export const redisFallback = new RedisFallbackManager();

// DUXXAN platform hash yöneticisi
export class DuxxanHashManager {
  async createUserSession(userId: string, userData: any): Promise<void> {
    const sessionKey = `duxxan:user:${userId}:session`;
    
    await redisFallback.hset(sessionKey, 'userId', userId);
    await redisFallback.hset(sessionKey, 'username', userData.username || 'user');
    await redisFallback.hset(sessionKey, 'email', userData.email || '');
    await redisFallback.hset(sessionKey, 'walletAddress', userData.walletAddress || '');
    await redisFallback.hset(sessionKey, 'lastLoginTime', new Date().toISOString());
    await redisFallback.hset(sessionKey, 'status', 'active');
    await redisFallback.hset(sessionKey, 'deviceType', userData.deviceType || 'web');
    await redisFallback.hset(sessionKey, 'totalRaffleEntries', '0');
    await redisFallback.hset(sessionKey, 'totalDonations', '0');
    
    console.log(`Kullanıcı oturumu oluşturuldu: ${sessionKey}`);
  }

  async updateRaffleStats(raffleId: string, stats: any): Promise<void> {
    const raffleKey = `duxxan:raffle:${raffleId}:live_stats`;
    
    await redisFallback.hset(raffleKey, 'raffleId', raffleId);
    await redisFallback.hset(raffleKey, 'title', stats.title || 'Çekiliş');
    await redisFallback.hset(raffleKey, 'totalEntries', stats.totalEntries?.toString() || '0');
    await redisFallback.hset(raffleKey, 'uniqueParticipants', stats.uniqueParticipants?.toString() || '0');
    await redisFallback.hset(raffleKey, 'prizeValue', stats.prizeValue?.toString() || '0');
    await redisFallback.hset(raffleKey, 'currency', stats.currency || 'USDT');
    await redisFallback.hset(raffleKey, 'status', stats.status || 'active');
    await redisFallback.hset(raffleKey, 'lastUpdated', new Date().toISOString());
    
    console.log(`Çekiliş istatistikleri güncellendi: ${raffleKey}`);
  }

  async trackTransaction(txHash: string, txData: any): Promise<void> {
    const txKey = `duxxan:tx:${txHash}`;
    
    await redisFallback.hset(txKey, 'transactionHash', txHash);
    await redisFallback.hset(txKey, 'type', txData.type || 'unknown');
    await redisFallback.hset(txKey, 'userId', txData.userId?.toString() || '');
    await redisFallback.hset(txKey, 'amount', txData.amount?.toString() || '0');
    await redisFallback.hset(txKey, 'currency', txData.currency || 'USDT');
    await redisFallback.hset(txKey, 'network', txData.network || 'BSC');
    await redisFallback.hset(txKey, 'status', txData.status || 'pending');
    await redisFallback.hset(txKey, 'timestamp', Date.now().toString());
    
    console.log(`Blockchain işlemi takip ediliyor: ${txKey}`);
  }

  async updatePlatformMetrics(metrics: any): Promise<void> {
    const metricsKey = 'duxxan:platform:live_metrics';
    
    await redisFallback.hset(metricsKey, 'totalUsers', metrics.totalUsers?.toString() || '0');
    await redisFallback.hset(metricsKey, 'activeRaffles', metrics.activeRaffles?.toString() || '0');
    await redisFallback.hset(metricsKey, 'totalVolume', metrics.totalVolume?.toString() || '0');
    await redisFallback.hset(metricsKey, 'onlineUsers', metrics.onlineUsers?.toString() || '0');
    await redisFallback.hset(metricsKey, 'serverStatus', 'operational');
    await redisFallback.hset(metricsKey, 'lastUpdated', new Date().toISOString());
    
    console.log('Platform metrikleri güncellendi');
  }

  async getUserSession(userId: string): Promise<any> {
    const sessionKey = `duxxan:user:${userId}:session`;
    return await redisFallback.hgetall(sessionKey);
  }

  async getRaffleStats(raffleId: string): Promise<any> {
    const raffleKey = `duxxan:raffle:${raffleId}:live_stats`;
    return await redisFallback.hgetall(raffleKey);
  }

  async getSystemStatus(): Promise<any> {
    const fallbackStatus = redisFallback.getStatus();
    const redisConnected = await redisFallback.checkRedisConnection();
    
    return {
      redis: {
        connected: redisConnected,
        url: process.env.REDIS_URL || 'not configured'
      },
      fallback: fallbackStatus,
      platform: 'operational'
    };
  }
}

export const hashManager = new DuxxanHashManager();

// Sistem başlatma
async function initializeHashSystem() {
  console.log('DUXXAN hash sistemi başlatılıyor...');
  
  await redisFallback.checkRedisConnection();
  
  // Test verisi oluştur
  await hashManager.createUserSession('1247', {
    username: 'crypto_trader_pro',
    email: 'trader@duxxan.com',
    walletAddress: '0x742d35Cc6634C0532925a3b8D6C8C6',
    deviceType: 'mobile'
  });
  
  await hashManager.updateRaffleStats('5', {
    title: 'iPhone 15 Pro Max',
    totalEntries: 127,
    uniqueParticipants: 89,
    prizeValue: 2500,
    currency: 'USDT',
    status: 'active'
  });
  
  await hashManager.trackTransaction('0xa1b2c3d4e5f6789', {
    type: 'raffle_entry',
    userId: 1247,
    amount: 25,
    currency: 'USDT',
    network: 'BSC',
    status: 'confirmed'
  });
  
  await hashManager.updatePlatformMetrics({
    totalUsers: 1247,
    activeRaffles: 8,
    totalVolume: 127450.75,
    onlineUsers: 47
  });
  
  const status = await hashManager.getSystemStatus();
  console.log('Hash sistemi durumu:', status);
  
  console.log('DUXXAN hash sistemi hazır');
}

// Eğer doğrudan çalıştırılıyorsa
if (require.main === module) {
  initializeHashSystem().then(() => {
    console.log('Hash sistem testi tamamlandı');
    process.exit(0);
  }).catch(error => {
    console.error('Hash sistem hatası:', error);
    process.exit(1);
  });
}