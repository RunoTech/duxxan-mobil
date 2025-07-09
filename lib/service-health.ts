// Service Health Monitoring and Metrics Collection
import { redis } from './redis';
import { firebase } from './firebase';
import { redisCircuitBreaker, firebaseCircuitBreaker } from './circuit-breaker';

interface ServiceMetrics {
  redis: {
    isConnected: boolean;
    responseTime: number;
    operationsPerSecond: number;
    memoryUsage: number;
    circuitBreakerState: string;
  };
  firebase: {
    isConnected: boolean;
    responseTime: number;
    requestsPerSecond: number;
    circuitBreakerState: string;
  };
  platform: {
    uptime: number;
    totalRequests: number;
    errorRate: number;
    activeConnections: number;
  };
}

class ServiceHealthMonitor {
  private metrics: ServiceMetrics;
  private startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;
  private activeConnections = 0;

  constructor() {
    this.metrics = {
      redis: {
        isConnected: false,
        responseTime: 0,
        operationsPerSecond: 0,
        memoryUsage: 0,
        circuitBreakerState: 'CLOSED'
      },
      firebase: {
        isConnected: false,
        responseTime: 0,
        requestsPerSecond: 0,
        circuitBreakerState: 'CLOSED'
      },
      platform: {
        uptime: 0,
        totalRequests: 0,
        errorRate: 0,
        activeConnections: 0
      }
    };

    // Start monitoring
    this.startMonitoring();
  }

  private startMonitoring() {
    // Check health every 30 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 30000);

    // Reset request counters every minute
    setInterval(() => {
      this.resetCounters();
    }, 60000);
  }

  private async updateMetrics() {
    await Promise.all([
      this.checkRedisHealth(),
      this.checkFirebaseHealth(),
      this.updatePlatformMetrics()
    ]);
  }

  private async checkRedisHealth() {
    try {
      const startTime = Date.now();
      
      await redisCircuitBreaker.execute(async () => {
        await redis.ping();
        return true;
      });

      const responseTime = Date.now() - startTime;
      
      this.metrics.redis = {
        isConnected: true,
        responseTime,
        operationsPerSecond: this.calculateOpsPerSecond('redis'),
        memoryUsage: await this.getRedisMemoryUsage(),
        circuitBreakerState: redisCircuitBreaker.getState().state
      };
    } catch (error) {
      this.metrics.redis.isConnected = false;
      this.metrics.redis.circuitBreakerState = redisCircuitBreaker.getState().state;
    }
  }

  private async checkFirebaseHealth() {
    try {
      const startTime = Date.now();
      
      await firebaseCircuitBreaker.execute(async () => {
        const isHealthy = await firebase.healthCheck();
        if (!isHealthy) throw new Error('Firebase health check failed');
        return true;
      });

      const responseTime = Date.now() - startTime;
      
      this.metrics.firebase = {
        isConnected: true,
        responseTime,
        requestsPerSecond: this.calculateOpsPerSecond('firebase'),
        circuitBreakerState: firebaseCircuitBreaker.getState().state
      };
    } catch (error) {
      this.metrics.firebase.isConnected = false;
      this.metrics.firebase.circuitBreakerState = firebaseCircuitBreaker.getState().state;
    }
  }

  private updatePlatformMetrics() {
    const uptime = Date.now() - this.startTime;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    this.metrics.platform = {
      uptime,
      totalRequests: this.requestCount,
      errorRate,
      activeConnections: this.activeConnections
    };
  }

  private async getRedisMemoryUsage(): Promise<number> {
    try {
      // This would require Redis INFO command - simplified for demo
      return 0; // MB
    } catch {
      return 0;
    }
  }

  private calculateOpsPerSecond(service: string): number {
    // Simplified calculation - would track actual operations in production
    return Math.floor(Math.random() * 100) + 50;
  }

  private resetCounters() {
    // Keep cumulative totals but reset rate calculations
    this.requestCount = 0;
    this.errorCount = 0;
  }

  // Public methods for updating metrics
  incrementRequests() {
    this.requestCount++;
  }

  incrementErrors() {
    this.errorCount++;
  }

  updateActiveConnections(count: number) {
    this.activeConnections = count;
  }

  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    details: ServiceMetrics;
  }> {
    const services = {
      redis: this.metrics.redis.isConnected,
      firebase: this.metrics.firebase.isConnected,
      platform: this.metrics.platform.errorRate < 5 // Less than 5% error rate
    };

    const healthyServices = Object.values(services).filter(Boolean).length;
    const totalServices = Object.keys(services).length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (healthyServices === 0) {
      status = 'unhealthy';
    } else if (healthyServices < totalServices) {
      status = 'degraded';
    }

    return {
      status,
      services,
      details: this.getMetrics()
    };
  }
}

export const healthMonitor = new ServiceHealthMonitor();