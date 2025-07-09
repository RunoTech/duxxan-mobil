import { Request, Response, NextFunction } from 'express';
import { config } from './config';

interface RequestMetrics {
  timestamp: number;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip: string;
}

interface PerformanceMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowQueries: number;
  activeConnections: number;
}

class MonitoringService {
  private metrics: RequestMetrics[] = [];
  private readonly MAX_METRICS = 10000;
  private startTime: number = Date.now();

  // Log request metrics
  logRequest(req: Request, res: Response, responseTime: number) {
    const metric: RequestMetrics = {
      timestamp: Date.now(),
      method: req.method,
      url: req.path,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || 'unknown'
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${responseTime}ms`);
    }

    // Log errors
    if (res.statusCode >= 400) {
      console.error(`Error request: ${req.method} ${req.path} returned ${res.statusCode}`);
    }
  }

  // Get performance metrics
  getMetrics(): PerformanceMetrics {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    
    const totalResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    const slowQueries = recentMetrics.filter(m => m.responseTime > 1000).length;

    return {
      requestCount: recentMetrics.length,
      errorCount,
      averageResponseTime: recentMetrics.length > 0 ? totalResponseTime / recentMetrics.length : 0,
      slowQueries,
      activeConnections: 0 // Would be implemented with actual connection tracking
    };
  }

  // Get endpoint statistics
  getEndpointStats() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    const endpointStats = new Map<string, {
      count: number;
      averageTime: number;
      errorRate: number;
    }>();

    recentMetrics.forEach(metric => {
      const endpoint = `${metric.method} ${metric.url}`;
      const existing = endpointStats.get(endpoint) || { count: 0, averageTime: 0, errorRate: 0 };
      
      existing.count++;
      existing.averageTime = (existing.averageTime * (existing.count - 1) + metric.responseTime) / existing.count;
      
      if (metric.statusCode >= 400) {
        existing.errorRate = (existing.errorRate * (existing.count - 1) + 1) / existing.count;
      } else {
        existing.errorRate = (existing.errorRate * (existing.count - 1)) / existing.count;
      }

      endpointStats.set(endpoint, existing);
    });

    return Object.fromEntries(endpointStats);
  }

  // Get system health
  getHealth() {
    const metrics = this.getMetrics();
    const uptime = Date.now() - this.startTime;
    
    return {
      status: 'healthy',
      uptime,
      metrics,
      timestamp: Date.now(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  // Clear old metrics
  cleanup() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneWeekAgo);
  }
}

export const monitoring = new MonitoringService();

// Cleanup old metrics every hour
setInterval(() => {
  monitoring.cleanup();
}, 60 * 60 * 1000);

// Request timing middleware
export const requestTimingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    monitoring.logRequest(req, res, responseTime);
  });

  next();
};

// Health check endpoint
export const healthCheckHandler = (req: Request, res: Response) => {
  const health = monitoring.getHealth();
  
  // Determine if system is healthy
  const isHealthy = health.metrics.errorCount < 100 && 
                   health.metrics.averageResponseTime < 2000;

  res.status(isHealthy ? 200 : 503).json(health);
};

// Metrics endpoint
export const metricsHandler = (req: Request, res: Response) => {
  const metrics = monitoring.getMetrics();
  const endpointStats = monitoring.getEndpointStats();
  
  res.json({
    overview: metrics,
    endpoints: endpointStats,
    timestamp: Date.now()
  });
};

// Error tracking
export class ErrorTracker {
  private errors: Array<{
    timestamp: number;
    message: string;
    stack?: string;
    url: string;
    userId?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  logError(error: Error, req?: Request, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const errorLog = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      url: req?.path || 'unknown',
      userId: (req as any)?.user?.id?.toString() || undefined,
      severity
    };

    this.errors.push(errorLog);

    // Keep only recent errors
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }

    // Log to console based on severity
    if (severity === 'critical') {
      console.error('CRITICAL ERROR:', errorLog);
    } else if (severity === 'high') {
      console.error('HIGH SEVERITY ERROR:', errorLog);
    } else {
      console.warn('ERROR:', errorLog);
    }
  }

  getRecentErrors(hours = 24) {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.errors.filter(e => e.timestamp > cutoff);
  }

  getErrorStats() {
    const recentErrors = this.getRecentErrors();
    
    return {
      total: recentErrors.length,
      bySeverity: {
        low: recentErrors.filter(e => e.severity === 'low').length,
        medium: recentErrors.filter(e => e.severity === 'medium').length,
        high: recentErrors.filter(e => e.severity === 'high').length,
        critical: recentErrors.filter(e => e.severity === 'critical').length,
      },
      mostCommon: this.getMostCommonErrors(recentErrors)
    };
  }

  private getMostCommonErrors(errors: typeof this.errors) {
    const errorCounts = new Map<string, number>();
    
    errors.forEach(error => {
      const key = error.message;
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });

    return Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));
  }
}

export const errorTracker = new ErrorTracker();

// Global error handler middleware
export const errorHandlerMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Determine severity based on error type
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  
  if (err.name === 'ValidationError') {
    severity = 'low';
  } else if (err.message.includes('Database') || err.message.includes('Connection')) {
    severity = 'critical';
  } else if (res.statusCode >= 500) {
    severity = 'high';
  }

  errorTracker.logError(err, req, severity);

  // Don't expose internal errors in production
  if (config.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      timestamp: Date.now()
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      timestamp: Date.now()
    });
  }
};

// Performance monitoring for database queries
export const queryPerformanceTracker = {
  trackQuery: (queryName: string, duration: number) => {
    if (duration > 1000) {
      console.warn(`Slow database query: ${queryName} took ${duration}ms`);
    }
    
    monitoring.logRequest(
      { method: 'DB', path: queryName } as Request,
      { statusCode: 200 } as Response,
      duration
    );
  }
};