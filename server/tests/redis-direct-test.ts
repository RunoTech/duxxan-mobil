import { redis } from '../lib/redis';

async function createRedisHashesDirectly() {
  console.log('Redis veritabanında hash oluşturuluyor...');
  
  try {
    // Direct connection test
    console.log('Bağlantı test ediliyor...');
    const result = await redis.ping();
    console.log('Redis ping sonucu:', result);
    
    if (!result) {
      throw new Error('Redis bağlantısı başarısız');
    }
    
    console.log('✅ Redis bağlantısı başarılı');
    
    // 1. Kullanıcı oturum hash'i oluştur
    console.log('\n1. Kullanıcı oturum hash\'i oluşturuluyor...');
    const sessionKey = 'duxxan:user:1247:session';
    
    await redis.hset(sessionKey, 'userId', '1247');
    await redis.hset(sessionKey, 'username', 'crypto_trader_pro');
    await redis.hset(sessionKey, 'email', 'trader@duxxan.com');
    await redis.hset(sessionKey, 'walletAddress', '0x742d35Cc6634C0532925a3b8D6C8C6');
    await redis.hset(sessionKey, 'totalRaffleEntries', '23');
    await redis.hset(sessionKey, 'totalDonations', '5');
    await redis.hset(sessionKey, 'memberSince', '2024-01-15');
    await redis.hset(sessionKey, 'lastLoginTime', new Date().toISOString());
    await redis.hset(sessionKey, 'deviceType', 'mobile');
    await redis.hset(sessionKey, 'ipAddress', '192.168.1.100');
    await redis.hset(sessionKey, 'status', 'active');
    await redis.hset(sessionKey, 'preferredLanguage', 'tr');
    
    console.log(`Hash oluşturuldu: ${sessionKey}`);
    
    // 2. Çekiliş istatistikleri hash'i
    console.log('\n2. Çekiliş istatistikleri hash\'i oluşturuluyor...');
    const raffleKey = 'duxxan:raffle:5:live_stats';
    
    await redis.hset(raffleKey, 'raffleId', '5');
    await redis.hset(raffleKey, 'title', 'iPhone 15 Pro Max 256GB');
    await redis.hset(raffleKey, 'description', 'En son iPhone modeli');
    await redis.hset(raffleKey, 'prizeValue', '2500.00');
    await redis.hset(raffleKey, 'currency', 'USDT');
    await redis.hset(raffleKey, 'entryPrice', '25.00');
    await redis.hset(raffleKey, 'totalEntries', '127');
    await redis.hset(raffleKey, 'uniqueParticipants', '89');
    await redis.hset(raffleKey, 'maxEntries', '200');
    await redis.hset(raffleKey, 'currentRevenue', '3175.00');
    await redis.hset(raffleKey, 'category', 'Elektronik');
    await redis.hset(raffleKey, 'status', 'active');
    await redis.hset(raffleKey, 'startDate', '2025-06-10T10:00:00Z');
    await redis.hset(raffleKey, 'endDate', '2025-06-20T18:00:00Z');
    await redis.hset(raffleKey, 'lastEntryTime', new Date().toISOString());
    
    console.log(`Hash oluşturuldu: ${raffleKey}`);
    
    // 3. Blockchain işlem hash'i
    console.log('\n3. Blockchain işlem hash\'i oluşturuluyor...');
    const txKey = 'duxxan:tx:0xa1b2c3d4e5f6789';
    
    await redis.hset(txKey, 'transactionHash', '0xa1b2c3d4e5f6789abcdef123456789');
    await redis.hset(txKey, 'blockHash', '0x9876543210fedcba9876543210fedcba');
    await redis.hset(txKey, 'blockNumber', '12845673');
    await redis.hset(txKey, 'type', 'raffle_entry');
    await redis.hset(txKey, 'userId', '1247');
    await redis.hset(txKey, 'raffleId', '5');
    await redis.hset(txKey, 'amount', '25.00');
    await redis.hset(txKey, 'currency', 'USDT');
    await redis.hset(txKey, 'network', 'BSC');
    await redis.hset(txKey, 'fromAddress', '0x742d35Cc6634C0532925a3b8D6C8C6');
    await redis.hset(txKey, 'toAddress', '0xDUXXAN_PLATFORM_WALLET_ADDRESS');
    await redis.hset(txKey, 'gasUsed', '21000');
    await redis.hset(txKey, 'gasPrice', '5000000000');
    await redis.hset(txKey, 'status', 'confirmed');
    await redis.hset(txKey, 'confirmations', '15');
    await redis.hset(txKey, 'timestamp', Date.now().toString());
    
    console.log(`Hash oluşturuldu: ${txKey}`);
    
    // 4. Platform metrikleri hash'i
    console.log('\n4. Platform metrikleri hash\'i oluşturuluyor...');
    const metricsKey = 'duxxan:platform:live_metrics';
    
    await redis.hset(metricsKey, 'totalUsers', '1247');
    await redis.hset(metricsKey, 'activeUsers', '156');
    await redis.hset(metricsKey, 'onlineUsers', '47');
    await redis.hset(metricsKey, 'totalRaffles', '8');
    await redis.hset(metricsKey, 'activeRaffles', '6');
    await redis.hset(metricsKey, 'totalDonations', '12');
    await redis.hset(metricsKey, 'activeDonations', '8');
    await redis.hset(metricsKey, 'totalVolume', '127450.75');
    await redis.hset(metricsKey, 'volume24h', '15234.50');
    await redis.hset(metricsKey, 'transactions24h', '89');
    await redis.hset(metricsKey, 'newUsers24h', '23');
    await redis.hset(metricsKey, 'totalPrizePool', '7120.00');
    await redis.hset(metricsKey, 'serverStatus', 'operational');
    await redis.hset(metricsKey, 'lastUpdated', new Date().toISOString());
    
    console.log(`Hash oluşturuldu: ${metricsKey}`);
    
    // 5. Bağış kampanyası hash'i
    console.log('\n5. Bağış kampanyası hash\'i oluşturuluyor...');
    const donationKey = 'duxxan:donation:5:campaign_stats';
    
    await redis.hset(donationKey, 'donationId', '5');
    await redis.hset(donationKey, 'title', 'Kanser Hastaları için Destek');
    await redis.hset(donationKey, 'description', 'Kanser hastaları destek fonu');
    await redis.hset(donationKey, 'goalAmount', '5000.00');
    await redis.hset(donationKey, 'currentAmount', '3275.50');
    await redis.hset(donationKey, 'currency', 'USDT');
    await redis.hset(donationKey, 'donorCount', '47');
    await redis.hset(donationKey, 'averageDonation', '69.69');
    await redis.hset(donationKey, 'category', 'Sağlık');
    await redis.hset(donationKey, 'beneficiary', 'Türk Kanser Derneği');
    await redis.hset(donationKey, 'status', 'active');
    await redis.hset(donationKey, 'startDate', '2025-06-01T00:00:00Z');
    await redis.hset(donationKey, 'endDate', '2025-06-30T23:59:59Z');
    await redis.hset(donationKey, 'lastDonationTime', new Date().toISOString());
    
    console.log(`Hash oluşturuldu: ${donationKey}`);
    
    // Hash'lerin oluşturulduğunu doğrula
    console.log('\n6. Hash\'ler doğrulanıyor...');
    
    const sessionData = await redis.hgetall(sessionKey);
    const raffleData = await redis.hgetall(raffleKey);
    const txData = await redis.hgetall(txKey);
    const metricsData = await redis.hgetall(metricsKey);
    const donationData = await redis.hgetall(donationKey);
    
    console.log(`${sessionKey}: ${Object.keys(sessionData).length} alan`);
    console.log(`${raffleKey}: ${Object.keys(raffleData).length} alan`);
    console.log(`${txKey}: ${Object.keys(txData).length} alan`);
    console.log(`${metricsKey}: ${Object.keys(metricsData).length} alan`);
    console.log(`${donationKey}: ${Object.keys(donationData).length} alan`);
    
    // Örnek veri okuma
    console.log('\n7. Örnek veri okuması:');
    const username = await redis.hget(sessionKey, 'username');
    const raffleTitle = await redis.hget(raffleKey, 'title');
    const txAmount = await redis.hget(txKey, 'amount');
    const totalUsers = await redis.hget(metricsKey, 'totalUsers');
    const donationGoal = await redis.hget(donationKey, 'goalAmount');
    
    console.log(`Kullanıcı adı: ${username}`);
    console.log(`Çekiliş başlığı: ${raffleTitle}`);
    console.log(`İşlem tutarı: ${txAmount} USDT`);
    console.log(`Toplam kullanıcı: ${totalUsers}`);
    console.log(`Bağış hedefi: ${donationGoal} USDT`);
    
    // Hash güncelleme testi
    console.log('\n8. Hash güncelleme testi:');
    await redis.hset(raffleKey, 'totalEntries', '128');
    const updatedEntries = await redis.hget(raffleKey, 'totalEntries');
    console.log(`Çekiliş katılımı güncellendi: ${updatedEntries}`);
    
    console.log('\n🎉 BAŞARILI: Tüm hash\'ler Redis veritabanında oluşturuldu ve doğrulandı');
    console.log('\nRedis CLI ile kontrol etmek için:');
    console.log(`HGETALL ${sessionKey}`);
    console.log(`HGETALL ${raffleKey}`);
    console.log(`HGETALL ${txKey}`);
    console.log(`HGETALL ${metricsKey}`);
    console.log(`HGETALL ${donationKey}`);
    
    return true;
    
  } catch (error) {
    console.error('Redis hash oluşturma hatası:', error.message);
    return false;
  }
}

createRedisHashesDirectly().then(success => {
  console.log(success ? '\n✅ Redis hash testı başarılı' : '\n❌ Redis hash testı başarısız');
  process.exit(success ? 0 : 1);
});