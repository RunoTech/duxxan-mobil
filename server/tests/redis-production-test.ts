import { redis } from '../lib/redis';

async function createProductionRedisHashes() {
  console.log('Redis prodüksiyon veritabanında hash oluşturuluyor...');
  
  try {
    // Redis bağlantısını test et
    console.log('Redis bağlantısı test ediliyor...');
    const pingResult = await redis.ping();
    
    if (!pingResult) {
      console.log('HATA: Redis sunucusuna bağlanılamıyor');
      console.log('Mevcut REDIS_URL:', process.env.REDIS_URL);
      console.log('Lütfen çalışan bir Redis URL\'si sağlayın');
      return false;
    }
    
    console.log('✅ Redis bağlantısı başarılı');
    
    // DUXXAN platform hash'lerini oluştur
    console.log('\nDUXXAN platform hash\'leri oluşturuluyor...');
    
    // 1. Kullanıcı oturum hash'i
    const sessionKey = 'duxxan:user:1247:session';
    await redis.hset(sessionKey, 'userId', '1247');
    await redis.hset(sessionKey, 'username', 'crypto_trader_pro');
    await redis.hset(sessionKey, 'email', 'trader@duxxan.com');
    await redis.hset(sessionKey, 'walletAddress', '0x742d35Cc6634C0532925a3b8D6C8C6');
    await redis.hset(sessionKey, 'totalRaffleEntries', '23');
    await redis.hset(sessionKey, 'totalDonations', '5');
    await redis.hset(sessionKey, 'lastLoginTime', new Date().toISOString());
    await redis.hset(sessionKey, 'status', 'active');
    
    console.log('✅ Kullanıcı oturum hash\'i oluşturuldu:', sessionKey);
    
    // 2. Çekiliş istatistikleri hash'i
    const raffleKey = 'duxxan:raffle:5:live_stats';
    await redis.hset(raffleKey, 'raffleId', '5');
    await redis.hset(raffleKey, 'title', 'iPhone 15 Pro Max 256GB');
    await redis.hset(raffleKey, 'prizeValue', '2500.00');
    await redis.hset(raffleKey, 'currency', 'USDT');
    await redis.hset(raffleKey, 'totalEntries', '127');
    await redis.hset(raffleKey, 'uniqueParticipants', '89');
    await redis.hset(raffleKey, 'status', 'active');
    await redis.hset(raffleKey, 'lastUpdated', new Date().toISOString());
    
    console.log('✅ Çekiliş istatistikleri hash\'i oluşturuldu:', raffleKey);
    
    // 3. Blockchain işlem hash'i
    const txKey = 'duxxan:tx:0xa1b2c3d4e5f6789';
    await redis.hset(txKey, 'transactionHash', '0xa1b2c3d4e5f6789abcdef123456789');
    await redis.hset(txKey, 'type', 'raffle_entry');
    await redis.hset(txKey, 'userId', '1247');
    await redis.hset(txKey, 'amount', '25.00');
    await redis.hset(txKey, 'currency', 'USDT');
    await redis.hset(txKey, 'network', 'BSC');
    await redis.hset(txKey, 'status', 'confirmed');
    await redis.hset(txKey, 'timestamp', Date.now().toString());
    
    console.log('✅ Blockchain işlem hash\'i oluşturuldu:', txKey);
    
    // 4. Platform metrikleri hash'i
    const metricsKey = 'duxxan:platform:live_metrics';
    await redis.hset(metricsKey, 'totalUsers', '1247');
    await redis.hset(metricsKey, 'activeRaffles', '8');
    await redis.hset(metricsKey, 'totalVolume', '127450.75');
    await redis.hset(metricsKey, 'onlineUsers', '47');
    await redis.hset(metricsKey, 'serverStatus', 'operational');
    await redis.hset(metricsKey, 'lastUpdated', new Date().toISOString());
    
    console.log('✅ Platform metrikleri hash\'i oluşturuldu:', metricsKey);
    
    // Hash'lerin oluşturulduğunu doğrula
    console.log('\nOluşturulan hash\'ler doğrulanıyor...');
    
    const sessionData = await redis.hgetall(sessionKey);
    const raffleData = await redis.hgetall(raffleKey);
    const txData = await redis.hgetall(txKey);
    const metricsData = await redis.hgetall(metricsKey);
    
    console.log(`📊 ${sessionKey}: ${Object.keys(sessionData).length} alan`);
    console.log(`📊 ${raffleKey}: ${Object.keys(raffleData).length} alan`);
    console.log(`📊 ${txKey}: ${Object.keys(txData).length} alan`);
    console.log(`📊 ${metricsKey}: ${Object.keys(metricsData).length} alan`);
    
    // Örnek alan okuma
    const username = await redis.hget(sessionKey, 'username');
    const raffleTitle = await redis.hget(raffleKey, 'title');
    
    console.log('\n📝 Örnek veri okuması:');
    console.log(`   Kullanıcı adı: ${username}`);
    console.log(`   Çekiliş başlığı: ${raffleTitle}`);
    
    console.log('\n🎉 BAŞARILI: Tüm hash\'ler Redis veritabanında oluşturuldu');
    console.log('Redis CLI ile kontrol etmek için:');
    console.log('   HGETALL duxxan:user:1247:session');
    console.log('   HGETALL duxxan:raffle:5:live_stats');
    console.log('   HGETALL duxxan:tx:0xa1b2c3d4e5f6789');
    console.log('   HGETALL duxxan:platform:live_metrics');
    
    return true;
    
  } catch (error) {
    console.error('Redis hash oluşturma hatası:', error.message);
    return false;
  }
}

createProductionRedisHashes().then(success => {
  console.log(success ? '\n✅ Hash oluşturma tamamlandı' : '\n❌ Hash oluşturma başarısız');
  process.exit(success ? 0 : 1);
});