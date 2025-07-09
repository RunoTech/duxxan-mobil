// Disabled Redis service to prevent connection issues
class RedisService {
  private isConnected: boolean = false;
  private performanceMetrics = {
    operationCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    startTime: Date.now()
  };

  constructor() {
    console.log('Redis disabled for stability');
    this.isConnected = false;
  }

  getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    // No-op
  }

  async get<T>(key: string): Promise<T | null> {
    return null;
  }

  async del(key: string): Promise<void> {
    // No-op
  }

  async exists(key: string): Promise<boolean> {
    return false;
  }

  async hset(key: string, field: string, value: any): Promise<void> {
    // No-op
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    return null;
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    return {};
  }

  async hdel(key: string, field: string): Promise<void> {
    // No-op
  }

  async lpush(key: string, value: any): Promise<void> {
    // No-op
  }

  async rpush(key: string, value: any): Promise<void> {
    // No-op
  }

  async lpop<T>(key: string): Promise<T | null> {
    return null;
  }

  async rpop<T>(key: string): Promise<T | null> {
    return null;
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    return [];
  }

  async sadd(key: string, member: any): Promise<void> {
    // No-op
  }

  async srem(key: string, member: any): Promise<void> {
    // No-op
  }

  async smembers<T>(key: string): Promise<T[]> {
    return [];
  }

  async sismember(key: string, member: any): Promise<boolean> {
    return false;
  }

  async publish(channel: string, message: any): Promise<void> {
    // No-op
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    // No-op
  }

  async unsubscribe(channel: string): Promise<void> {
    // No-op
  }

  async setSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    // No-op
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    // No-op
  }

  async cacheRaffles(raffles: any[], ttl: number = 300): Promise<void> {
    // No-op
  }

  async getCachedRaffles<T>(): Promise<T[] | null> {
    return null;
  }

  async cacheDonations(donations: any[], ttl: number = 300): Promise<void> {
    // No-op
  }

  async getCachedDonations<T>(): Promise<T[] | null> {
    return null;
  }

  async invalidateCache(pattern: string): Promise<void> {
    // No-op
  }

  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number }> {
    return { allowed: true, remaining: limit };
  }

  async addToQueue(queueName: string, job: any, priority: number = 0): Promise<void> {
    // No-op
  }

  async getFromQueue<T>(queueName: string): Promise<T | null> {
    return null;
  }

  async getQueueLength(queueName: string): Promise<number> {
    return 0;
  }

  async trackTransaction(txHash: string, data: any): Promise<void> {
    // No-op
  }

  async updateTransactionStatus(txHash: string, status: string, blockNumber?: number): Promise<void> {
    // No-op
  }

  async getTransaction<T>(txHash: string): Promise<T | null> {
    return null;
  }

  async addConnection(userId: number, socketId: string): Promise<void> {
    // No-op
  }

  async removeConnection(userId: number, socketId: string): Promise<void> {
    // No-op
  }

  async getUserConnections(userId: number): Promise<string[]> {
    return [];
  }

  async getUserFromSocket(socketId: string): Promise<number | null> {
    return null;
  }

  async ping(): Promise<boolean> {
    return false;
  }

  async disconnect(): Promise<void> {
    // No-op
  }
}

export const redis = new RedisService();